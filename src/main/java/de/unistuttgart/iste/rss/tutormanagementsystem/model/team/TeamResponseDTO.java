package de.unistuttgart.iste.rss.tutormanagementsystem.model.team;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.HasId;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.jsonconverter.PointIdKeyDeserializer;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.PointId;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.StudentResponseDTO;
import lombok.Getter;

/**
 * Represents a {@link Team} returned by the REST API.
 */
@Getter
public class TeamResponseDTO extends HasId {

    private final int teamNo;

    private final UUID tutorial;

    private final List<StudentResponseDTO> students;

    @JsonDeserialize(keyUsing = PointIdKeyDeserializer.class)
    private final Map<PointId, Double> points;

    TeamResponseDTO() {
        this(new Team());
    }

    public TeamResponseDTO(final Team team) {
        super(team.getId());

        this.teamNo = team.getTeamNo();
        this.tutorial = team.getTutorial().getId();
        this.students = team.getStudents().stream().map(student -> new StudentResponseDTO(student))
                .collect(Collectors.toList());
        this.points = new HashMap<>(team.getPoints());
    }

}
