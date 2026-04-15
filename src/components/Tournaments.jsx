import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  createRegistration,
  fetchCodmLeaderboard,
  fetchTournamentMatches,
  fetchTournaments,
} from '../services/api';
import { subscribeToLiveUpdates } from '../services/realtime';
import { useAuth } from '../context/AuthContext';

const currency = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  maximumFractionDigits: 0,
});

function Tournaments({ timing = {} }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registeringId, setRegisteringId] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState({});
  const [activeTournamentId, setActiveTournamentId] = useState(null);
  const [matchData, setMatchData] = useState({ matches: [] });
  const [codmData, setCodmData] = useState({ leaderboard: [], teams: [] });

  const sectionDelay = timing.sectionDelay ?? 0.2;
  const sectionDuration = timing.sectionDuration ?? 0.62;
  const cardStagger = timing.cardStagger ?? 0.08;

  useEffect(() => {
    let mounted = true;

    const loadTournaments = async () => {
      try {
        const response = await fetchTournaments();
        const normalized = Array.isArray(response) ? response : [];
        if (mounted) {
          setTournaments(normalized);
          setActiveTournamentId((prev) => prev || normalized[0]?.id || null);
          setError('');
        }
      } catch (err) {
        if (mounted) {
          setError('Unable to load tournaments right now.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadTournaments();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    fetchCodmLeaderboard()
      .then((data) => setCodmData(data || { leaderboard: [], teams: [] }))
      .catch(() => {
        // Keep this non-blocking so tournament cards still render.
      });
  }, []);

  useEffect(() => {
    if (!activeTournamentId) return;

    fetchTournamentMatches(activeTournamentId)
      .then((data) => setMatchData(data || { matches: [] }))
      .catch(() => setMatchData({ matches: [] }));
  }, [activeTournamentId]);

  useEffect(() => {
    const unsubscribe = subscribeToLiveUpdates((event) => {
      if (!event || event.resource !== 'tournament') {
        if (event?.resource === 'tournament_match' && event?.tournament_id === activeTournamentId) {
          fetchTournamentMatches(activeTournamentId)
            .then((data) => setMatchData(data || { matches: [] }))
            .catch(() => setMatchData({ matches: [] }));
        }
        return;
      }

      setTournaments((prev) => {
        const current = Array.isArray(prev) ? prev : [];

        if (event.action === 'destroyed') {
          return current.filter((item) => item.id !== event.id);
        }

        const incoming = event.data;
        if (!incoming || !incoming.id) {
          return current;
        }

        const index = current.findIndex((item) => item.id === incoming.id);
        if (index === -1) {
          return [incoming, ...current];
        }

        const updated = [...current];
        updated[index] = { ...updated[index], ...incoming };
        return updated;
      });
    });

    return () => {
      unsubscribe();
    };
  }, [activeTournamentId]);

  const upcomingTournaments = useMemo(() => tournaments.slice(0, 4), [tournaments]);
  const liveMatches = useMemo(
    () => (Array.isArray(matchData?.matches) ? matchData.matches : []).filter((item) => item.status !== 'completed').slice(0, 4),
    [matchData]
  );

  const formatFee = (entryFee) => {
    if (typeof entryFee === 'number') {
      return currency.format(entryFee);
    }
    const parsed = Number(entryFee);
    return Number.isFinite(parsed) ? currency.format(parsed) : 'Free';
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return 'Date TBD';
    }
    const date = new Date(dateValue);
    return Number.isNaN(date.getTime())
      ? 'Date TBD'
      : date.toLocaleString('en-KE', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
  };

  const handleRegister = async (tournamentId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setRegisteringId(tournamentId);
    try {
      await createRegistration({ registration: { tournament_id: tournamentId } });
      setRegistrationStatus((prev) => ({ ...prev, [tournamentId]: 'Registered successfully' }));
    } catch (err) {
      setRegistrationStatus((prev) => ({ ...prev, [tournamentId]: 'Unable to register right now' }));
    } finally {
      setRegisteringId(null);
      window.setTimeout(() => {
        setRegistrationStatus((prev) => ({ ...prev, [tournamentId]: '' }));
      }, 2000);
    }
  };

  return (
    <motion.section
      id="tournaments"
      className="section-block"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: sectionDuration, delay: sectionDelay }}
    >
      <div className="container-12">
        <div className="section-header-premium">
          <h2>Tournaments</h2>
        </div>

        {loading ? (
          <div className="tournaments-row" aria-label="Loading tournaments">
            {[1, 2, 3].map((item) => (
              <div key={item} className="glass-card skeleton-card" />
            ))}
          </div>
        ) : null}
        {!loading && error ? <p className="section-status section-status-error">{error}</p> : null}

        <div className="tournaments-row">
          {upcomingTournaments.map((event, index) => (
            <motion.article
              key={event.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.26, delay: sectionDelay + index * cardStagger }}
              whileHover={{ y: -5, rotateX: 1.5, rotateY: -1.5 }}
              className="glass-card tournament-card-premium"
            >
              <h3>{event.name || 'Untitled tournament'}</h3>
              <p>{formatDate(event.date)}</p>
              <p>Game: <strong>{event.game_title || 'CODM'}</strong></p>
              <p>Format: <strong>{event.format_type === 'double_elimination' ? 'Double Elimination' : 'Single Elimination'}</strong></p>
              <p>Players: <strong>{event.registrations_count || 0}/{event.max_players || 0}</strong></p>
              <p>Entry Fee: <strong>{formatFee(event.entry_fee)}</strong></p>
              <button
                type="button"
                className="btn-gold"
                onClick={() => {
                  setActiveTournamentId(event.id);
                  handleRegister(event.id);
                }}
                disabled={registeringId === event.id}
              >
                {registeringId === event.id ? 'Registering...' : 'Register Now'}
              </button>
              {registrationStatus[event.id] ? <p className="section-status">{registrationStatus[event.id]}</p> : null}
            </motion.article>
          ))}

          <aside className="glass-card leaderboard-card">
            <h3>CODM Leaderboard</h3>
            <ul>
              {(codmData?.leaderboard || []).slice(0, 4).map((player, index) => (
                <li key={player.id || `${player.player_name}-${index}`}>
                  {index + 1}. {player.player_name} - {player.kills} kills ({player.win_rate}% WR)
                </li>
              ))}
              {(codmData?.leaderboard || []).length === 0 ? <li>No CODM player stats yet.</li> : null}
            </ul>
          </aside>
        </div>

        <div className="tournaments-row mt-3">
          <aside className="glass-card leaderboard-card">
            <h3>Live Match Updates</h3>
            {activeTournamentId ? <p className="section-status">Tournament #{activeTournamentId}</p> : null}
            <ul>
              {liveMatches.map((match) => (
                <li key={match.id}>
                  R{match.round_number} #{match.position_in_round} | {match.player_one?.username || 'TBD'} vs {match.player_two?.username || 'TBD'} | {match.status}
                </li>
              ))}
              {liveMatches.length === 0 ? <li>No active matches right now.</li> : null}
            </ul>
          </aside>

          <aside className="glass-card leaderboard-card">
            <h3>Team Profiles</h3>
            <ul>
              {(codmData?.teams || []).slice(0, 4).map((team) => (
                <li key={team.id}>
                  [{team.tag}] {team.name} | {team.wins}-{team.losses} ({team.win_rate}% WR)
                </li>
              ))}
              {(codmData?.teams || []).length === 0 ? <li>No teams published yet.</li> : null}
            </ul>
          </aside>
        </div>

        {!loading && !error && upcomingTournaments.length === 0 ? (
          <p className="section-status">No tournaments published yet.</p>
        ) : null}
      </div>
    </motion.section>
  );
}

export default Tournaments;
