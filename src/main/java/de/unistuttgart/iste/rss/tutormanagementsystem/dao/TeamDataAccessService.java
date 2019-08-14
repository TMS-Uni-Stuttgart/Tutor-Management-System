package de.unistuttgart.iste.rss.tutormanagementsystem.dao;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Repository;
import de.unistuttgart.iste.rss.tutormanagementsystem.dao.model.TeamDao;
import de.unistuttgart.iste.rss.tutormanagementsystem.dao.repositories.TeamRepository;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.team.Team;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;

/**
 * TeamDataAccessService
 */
@Repository
public class TeamDataAccessService implements TeamDao {

    private final TeamRepository teamRepository;

    @Autowired
    public TeamDataAccessService(TeamRepository teamRepository) {
        this.teamRepository = teamRepository;
    }

    @Override
    public Team saveTeam(Team team) {
        return teamRepository.save(team);
    }

    @Override
    public List<Team> getAllTeams(final UUID tutorialId) {
        List<Team> teamList = new ArrayList<>();

        teamRepository.findAllByTutorialId(tutorialId).forEach(team -> teamList.add(team));

        return teamList;
    }

    @Override
    public Team getTeam(final UUID tutorialId, final UUID id) throws ElementNotFoundException {
        Optional<Team> team = teamRepository.findByTutorialIdAndId(tutorialId, id);

        if (team.isEmpty()) {
            throw new ElementNotFoundException();
        }

        return team.get();
    }

    @Override
    public void deleteTeam(UUID id) throws ElementNotFoundException {
        try {
            teamRepository.deleteById(id);
        } catch (EmptyResultDataAccessException e) {
            throw new ElementNotFoundException();
        }

    }

    // @Override
    // public Team updateTeam(UUID id, Team updatedTeam) throws ElementNotFoundException {
    // try {
    // teamRepository.deleteById(id);
    // return teamRepository.save(updatedTeam);
    // } catch (EmptyResultDataAccessException e) {
    // throw new ElementNotFoundException();
    // }
    // }

}
