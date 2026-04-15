import React, { useEffect, useMemo, useState } from 'react';
import {
  createCodmPlayerStat,
  createTeamProfile,
  createTournament,
  fetchCodmLeaderboard,
  fetchTournamentDetails,
  fetchTournaments,
  generateTournamentBracket,
  simulateTournamentMatch,
} from '../../services/api';

const initialTournamentForm = {
  name: '',
  date: '',
  entry_fee: 0,
  game_title: 'CODM',
  max_players: 16,
  format_type: 'single_elimination',
  status: 'open',
};

function TournamentManagement() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState(null);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [form, setForm] = useState(initialTournamentForm);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [codmData, setCodmData] = useState({ leaderboard: [], teams: [] });

  const [teamForm, setTeamForm] = useState({ name: '', tag: '', region: 'Kenya', wins: 0, losses: 0 });
  const [playerForm, setPlayerForm] = useState({ player_name: '', in_game_rank: 'Master', kills: 0, matches_played: 0, wins: 0, team_profile_id: '' });

  const sortedTournaments = useMemo(
    () => [...tournaments].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)),
    [tournaments]
  );

  const loadTournaments = async () => {
    const data = await fetchTournaments();
    setTournaments(Array.isArray(data) ? data : []);
  };

  const loadCodm = async () => {
    const data = await fetchCodmLeaderboard();
    setCodmData(data || { leaderboard: [], teams: [] });
  };

  const loadTournamentDetails = async (id) => {
    const data = await fetchTournamentDetails(id);
    setSelectedTournament(data);
  };

  useEffect(() => {
    loadTournaments().catch(() => setError('Unable to load tournaments'));
    loadCodm().catch(() => setError('Unable to load CODM leaderboard'));
  }, []);

  useEffect(() => {
    if (!selectedTournamentId) return;
    loadTournamentDetails(selectedTournamentId).catch(() => setError('Unable to load selected tournament details'));
  }, [selectedTournamentId]);

  const submitTournament = async (event) => {
    event.preventDefault();
    setStatus('Creating tournament...');
    setError('');

    try {
      await createTournament(form);
      setForm(initialTournamentForm);
      setStatus('Tournament created');
      await loadTournaments();
    } catch (err) {
      setError(err?.response?.data?.error || 'Tournament creation failed');
      setStatus('');
    }
  };

  const handleGenerateBracket = async () => {
    if (!selectedTournamentId) return;
    setStatus('Generating bracket...');
    setError('');

    try {
      await generateTournamentBracket(selectedTournamentId);
      setStatus('Bracket generated');
      await loadTournamentDetails(selectedTournamentId);
      await loadTournaments();
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to generate bracket');
      setStatus('');
    }
  };

  const handleSimulate = async () => {
    if (!selectedTournamentId) return;
    setStatus('Simulating next match...');
    setError('');

    try {
      await simulateTournamentMatch(selectedTournamentId);
      setStatus('Match simulation complete');
      await loadTournamentDetails(selectedTournamentId);
      await loadTournaments();
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to simulate match');
      setStatus('');
    }
  };

  const submitTeam = async (event) => {
    event.preventDefault();
    try {
      await createTeamProfile(teamForm);
      setTeamForm({ name: '', tag: '', region: 'Kenya', wins: 0, losses: 0 });
      await loadCodm();
      setStatus('Team profile created');
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to create team profile');
    }
  };

  const submitPlayer = async (event) => {
    event.preventDefault();
    try {
      await createCodmPlayerStat({
        ...playerForm,
        team_profile_id: playerForm.team_profile_id || null,
      });
      setPlayerForm({ player_name: '', in_game_rank: 'Master', kills: 0, matches_played: 0, wins: 0, team_profile_id: '' });
      await loadCodm();
      setStatus('CODM player stat created');
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to create player stat');
    }
  };

  return (
    <section className="admin-tournament-shell">
      <h3>Tournament Creation Dashboard</h3>
      {status ? <p className="section-status">{status}</p> : null}
      {error ? <p className="section-status section-status-error">{error}</p> : null}

      <div className="admin-tournament-grid">
        <article className="glass-card admin-panel-card">
          <h4>Create Tournament</h4>
          <form className="admin-simple-form" onSubmit={submitTournament}>
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Tournament name" required />
            <input type="datetime-local" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} required />
            <input type="number" min="0" value={form.entry_fee} onChange={(e) => setForm((p) => ({ ...p, entry_fee: Number(e.target.value) }))} placeholder="Entry fee" />
            <input type="number" min="2" value={form.max_players} onChange={(e) => setForm((p) => ({ ...p, max_players: Number(e.target.value) }))} placeholder="Max players" />
            <select value={form.format_type} onChange={(e) => setForm((p) => ({ ...p, format_type: e.target.value }))}>
              <option value="single_elimination">Single Elimination</option>
              <option value="double_elimination">Double Elimination</option>
            </select>
            <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
              <option value="draft">Draft</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <button type="submit" className="btn btn-primary btn-sm">Create Tournament</button>
          </form>
        </article>

        <article className="glass-card admin-panel-card">
          <h4>Bracket Controls</h4>
          <select
            value={selectedTournamentId || ''}
            onChange={(event) => setSelectedTournamentId(Number(event.target.value) || null)}
          >
            <option value="">Select tournament</option>
            {sortedTournaments.map((item) => (
              <option key={item.id} value={item.id}>{item.name} ({item.status})</option>
            ))}
          </select>

          <div className="admin-button-row">
            <button type="button" className="btn btn-outline-light btn-sm" onClick={handleGenerateBracket} disabled={!selectedTournamentId}>Generate Bracket</button>
            <button type="button" className="btn btn-warning btn-sm" onClick={handleSimulate} disabled={!selectedTournamentId}>Simulate Live Match</button>
          </div>

          {selectedTournament ? (
            <div className="admin-bracket-preview">
              <p><strong>{selectedTournament.name}</strong></p>
              <p>Players: {selectedTournament.registrations_count}/{selectedTournament.max_players}</p>
              <p>Format: {selectedTournament.format_type}</p>
              <p>Status: {selectedTournament.status}</p>
              <p>Matches: {selectedTournament.matches_count}</p>
            </div>
          ) : null}
        </article>
      </div>

      <div className="admin-tournament-grid">
        <article className="glass-card admin-panel-card">
          <h4>Team Profiles</h4>
          <form className="admin-simple-form" onSubmit={submitTeam}>
            <input value={teamForm.name} onChange={(e) => setTeamForm((p) => ({ ...p, name: e.target.value }))} placeholder="Team name" required />
            <input value={teamForm.tag} onChange={(e) => setTeamForm((p) => ({ ...p, tag: e.target.value }))} placeholder="Tag" required />
            <input value={teamForm.region} onChange={(e) => setTeamForm((p) => ({ ...p, region: e.target.value }))} placeholder="Region" />
            <div className="admin-inline-fields">
              <input type="number" min="0" value={teamForm.wins} onChange={(e) => setTeamForm((p) => ({ ...p, wins: Number(e.target.value) }))} placeholder="Wins" />
              <input type="number" min="0" value={teamForm.losses} onChange={(e) => setTeamForm((p) => ({ ...p, losses: Number(e.target.value) }))} placeholder="Losses" />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">Add Team</button>
          </form>
        </article>

        <article className="glass-card admin-panel-card">
          <h4>CODM Player Stats</h4>
          <form className="admin-simple-form" onSubmit={submitPlayer}>
            <input value={playerForm.player_name} onChange={(e) => setPlayerForm((p) => ({ ...p, player_name: e.target.value }))} placeholder="Player name" required />
            <input value={playerForm.in_game_rank} onChange={(e) => setPlayerForm((p) => ({ ...p, in_game_rank: e.target.value }))} placeholder="Rank" />
            <div className="admin-inline-fields">
              <input type="number" min="0" value={playerForm.kills} onChange={(e) => setPlayerForm((p) => ({ ...p, kills: Number(e.target.value) }))} placeholder="Kills" />
              <input type="number" min="0" value={playerForm.matches_played} onChange={(e) => setPlayerForm((p) => ({ ...p, matches_played: Number(e.target.value) }))} placeholder="Matches" />
              <input type="number" min="0" value={playerForm.wins} onChange={(e) => setPlayerForm((p) => ({ ...p, wins: Number(e.target.value) }))} placeholder="Wins" />
            </div>
            <select value={playerForm.team_profile_id} onChange={(e) => setPlayerForm((p) => ({ ...p, team_profile_id: e.target.value }))}>
              <option value="">No team</option>
              {(codmData.teams || []).map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary btn-sm">Add Player</button>
          </form>
        </article>
      </div>
    </section>
  );
}

export default TournamentManagement;
