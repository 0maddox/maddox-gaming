import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createRegistration, fetchTournaments } from '../services/api';
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
    const unsubscribe = subscribeToLiveUpdates((event) => {
      if (!event || event.resource !== 'tournament') {
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
  }, []);

  const upcomingTournaments = useMemo(() => tournaments.slice(0, 4), [tournaments]);

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

        {loading ? <p className="section-status">Loading tournaments...</p> : null}
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
              <p>Prize Pool: <strong>Community Sponsored</strong></p>
              <p>Entry Fee: <strong>{formatFee(event.entry_fee)}</strong></p>
              <button
                type="button"
                className="btn-gold"
                onClick={() => handleRegister(event.id)}
                disabled={registeringId === event.id}
              >
                {registeringId === event.id ? 'Registering...' : 'Register Now'}
              </button>
              {registrationStatus[event.id] ? <p className="section-status">{registrationStatus[event.id]}</p> : null}
            </motion.article>
          ))}

          <aside className="glass-card leaderboard-card">
            <h3>Leaderboard</h3>
            <ul>
              <li>1st PlayerX - 1200 pts</li>
              <li>2nd Sniper254 - 980 pts</li>
              <li>3rd GhostKE - 870 pts</li>
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
