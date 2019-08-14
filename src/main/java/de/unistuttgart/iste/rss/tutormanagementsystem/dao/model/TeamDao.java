package de.unistuttgart.iste.rss.tutormanagementsystem.dao.model;

import java.util.List;
import java.util.UUID;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.team.Team;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;

/**
 * TeamDao
 */
public interface TeamDao {

    public Team saveTeam(final Team team);

    public List<Team> getAllTeams(final UUID tutorialId);

    public Team getTeam(final UUID tutorialId, final UUID id) throws ElementNotFoundException;

    public void deleteTeam(final UUID id) throws ElementNotFoundException;

    // public Team updateTeam(final UUID id, final Team team) throws ElementNotFoundException;

    // public Optional<User> getUserOfTeam(final UUID id) throws ElementNotFoundException;

    // public void setUserOfTeam(final UUID id, final User user) throws ElementNotFoundException;
}
