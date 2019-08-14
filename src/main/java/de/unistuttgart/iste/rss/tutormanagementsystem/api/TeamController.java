package de.unistuttgart.iste.rss.tutormanagementsystem.api;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.team.TeamDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.team.TeamResponseDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.UpdatePointsDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.TeamService;

/**
 * {@link RestController} responsible for all team related endpoints.
 */
@RestController
@CrossOrigin
@RequestMapping(path = "/api/tutorial/{tutorialId}/team")
public class TeamController {
    private final TeamService teamService;

    @Autowired
    public TeamController(final TeamService teamService) {
        this.teamService = teamService;
    }

    @GetMapping
    public @ResponseBody List<TeamResponseDTO> getAllTeams(@PathVariable UUID tutorialId) {
        var teams = teamService.getAllTeams(tutorialId);
        List<TeamResponseDTO> responseList =
                teams.stream().map(team -> new TeamResponseDTO(team)).collect(Collectors.toList());

        return responseList;
    }

    @PostMapping
    @ResponseStatus(code = HttpStatus.CREATED)
    @ResponseBody
    public TeamResponseDTO createTeam(@PathVariable UUID tutorialId, @RequestBody TeamDTO team)
            throws ElementNotFoundException {

        return new TeamResponseDTO(teamService.createTeam(tutorialId, team));
    }

    @GetMapping(path = "{id}")
    @ResponseBody
    public TeamResponseDTO getTeam(@PathVariable UUID tutorialId, @PathVariable UUID id)
            throws ElementNotFoundException {

        return new TeamResponseDTO(teamService.getTeam(tutorialId, id));
    }

    @PatchMapping(path = "{id}")
    @ResponseBody
    public TeamResponseDTO updateTeam(@PathVariable UUID tutorialId, @PathVariable UUID id,
            @RequestBody TeamDTO updatedTeam) throws ElementNotFoundException {

        return new TeamResponseDTO(teamService.updateTeam(tutorialId, id, updatedTeam));
    }

    @DeleteMapping(path = "{id}")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public void deleteTeam(@PathVariable UUID tutorialId, @PathVariable UUID id)
            throws ElementNotFoundException {
        teamService.deleteTeam(tutorialId, id);
    }

    @PutMapping(path = "{id}/points")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public void setPoints(@PathVariable UUID tutorialId, @PathVariable UUID id,
            @RequestBody UpdatePointsDTO points) throws ElementNotFoundException {

        teamService.setPoints(tutorialId, id, points);
    }
}
