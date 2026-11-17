/**
 * Fetches everything the Canucks page shows from the NHL's public web API.
 * Runs at build time (on GitHub Actions), so the browser's cross-origin rules don't apply.
 * Any failure throws, which fails the build and leaves the last good deploy online.
 */

const TEAM = 'VAN';
const API = 'https://api-web.nhle.com/v1/';

type Localized = { default: string };

interface ScheduleGame {
  gameType: number;
  gameDate: string;
  gameState: string;
  startTimeUTC: string;
  awayTeam: { abbrev: string; score?: number };
  homeTeam: { abbrev: string; score?: number };
  gameOutcome?: { lastPeriodType: string };
}

interface StandingRow {
  teamAbbrev: Localized;
  teamName: Localized;
  leagueSequence: number;
  wildcardSequence: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  otLosses: number;
  points: number;
  pointPctg: number;
}

interface Skater {
  playerId: number;
  firstName: Localized;
  lastName: Localized;
  points: number;
  goals: number;
  assists: number;
}

interface RosterPlayer {
  id: number;
  sweaterNumber?: number;
}

export interface GameResult {
  date: string;
  opp: string;
  home: boolean;
  us: number;
  them: number;
  result: 'W' | 'L' | 'OTL';
  ot?: string;
}

export interface CanucksData {
  asOf: string;
  team: string;
  teamAbbrev: string;
  results: GameResult[];
  nextGame: { date: string; opp: string; home: boolean; startUTC: string; time: string } | null;
  leaders: { name: string; number: number | null; points: number; goals: number; assists: number }[];
  draftOrder: {
    pick: number;
    abbrev: string;
    name: string;
    gp: number;
    w: number;
    l: number;
    otl: number;
    pts: number;
    pct: number;
    playoff: boolean;
  }[];
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(API + path, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`NHL API ${path}: HTTP ${res.status}`);
  return (await res.json()) as T;
}

const isFinal = (g: ScheduleGame) => g.gameState === 'OFF' || g.gameState === 'FINAL';

export async function fetchCanucksData(): Promise<CanucksData> {
  const [schedule, clubStats, roster, standings] = await Promise.all([
    get<{ games: ScheduleGame[] }>(`club-schedule-season/${TEAM}/now`),
    get<{ skaters: Skater[] }>(`club-stats/${TEAM}/now`),
    get<{ forwards: RosterPlayer[]; defensemen: RosterPlayer[]; goalies: RosterPlayer[] }>(`roster/${TEAM}/current`),
    get<{ standings: StandingRow[] }>('standings/now'),
  ]);

  const regular = schedule.games.filter((g) => g.gameType === 2);

  const results: GameResult[] = regular.filter(isFinal).map((g) => {
    const home = g.homeTeam.abbrev === TEAM;
    const us = (home ? g.homeTeam.score : g.awayTeam.score) ?? 0;
    const them = (home ? g.awayTeam.score : g.homeTeam.score) ?? 0;
    const last = g.gameOutcome?.lastPeriodType ?? 'REG';
    const r: GameResult = {
      date: g.gameDate,
      opp: home ? g.awayTeam.abbrev : g.homeTeam.abbrev,
      home,
      us,
      them,
      result: us > them ? 'W' : last !== 'REG' ? 'OTL' : 'L',
    };
    if (last !== 'REG') r.ot = last;
    return r;
  });

  const next = regular.find((g) => !isFinal(g));
  const nextGame = next
    ? {
        date: next.gameDate,
        opp: next.homeTeam.abbrev === TEAM ? next.awayTeam.abbrev : next.homeTeam.abbrev,
        home: next.homeTeam.abbrev === TEAM,
        startUTC: next.startTimeUTC,
        time:
          new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' }).format(
            new Date(next.startTimeUTC),
          ) + ' ET',
      }
    : null;

  const numbers = new Map(
    [...roster.forwards, ...roster.defensemen, ...roster.goalies].map((p) => [p.id, p.sweaterNumber ?? null]),
  );
  const leaders = [...clubStats.skaters]
    .sort((a, b) => b.points - a.points || b.goals - a.goals)
    .slice(0, 5)
    .map((p) => ({
      name: `${p.firstName.default} ${p.lastName.default}`,
      number: numbers.get(p.playerId) ?? null,
      points: p.points,
      goals: p.goals,
      assists: p.assists,
    }));

  // Draft order: teams outside playoff position pick first (1-16), worst record first, then playoff
  // teams. Within each group, reverse the NHL's own league ranking, which already applies its tiebreakers.
  // In playoff position = top 3 in the division (wildcardSequence 0) or wildcard 1-2.
  const inPlayoffSpot = (t: StandingRow) => t.wildcardSequence <= 2;
  const byWorst = (a: StandingRow, b: StandingRow) => b.leagueSequence - a.leagueSequence;
  const draftOrder = [
    ...standings.standings.filter((t) => !inPlayoffSpot(t)).sort(byWorst),
    ...standings.standings.filter(inPlayoffSpot).sort(byWorst),
  ].map((t, i) => ({
    pick: i + 1,
    abbrev: t.teamAbbrev.default,
    name: t.teamName.default,
    gp: t.gamesPlayed,
    w: t.wins,
    l: t.losses,
    otl: t.otLosses,
    pts: t.points,
    pct: Number(t.pointPctg.toFixed(3)),
    playoff: inPlayoffSpot(t),
  }));

  if (results.length === 0) throw new Error('NHL API returned no finished Canucks games');
  if (leaders.length === 0) throw new Error('NHL API returned no Canucks skaters');
  if (draftOrder.length !== 32) throw new Error(`Expected 32 teams in standings, got ${draftOrder.length}`);

  return { asOf: new Date().toISOString(), team: 'Canucks', teamAbbrev: TEAM, results, nextGame, leaders, draftOrder };
}
