package de.unistuttgart.iste.rss.tutormanagementsystem.model.student;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.NamedElement;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.attendance.Attendance;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.jsonconverter.PointIdKeyDeserializer;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.PointId;
import lombok.Getter;

/**
 * Represents a {@link Student} returned by the REST API.
 */
@Getter
public class StudentResponseDTO extends NamedElement {

    private final String matriculationNo;

    private final String email;

    private final String courseOfStudies;

    private final Optional<UUID> team;

    private final UUID tutorial;

    private final Map<Instant, Attendance> attendance;

    @JsonDeserialize(keyUsing = PointIdKeyDeserializer.class)
    private final Map<PointId, Double> points;

    private final Map<UUID, Double> presentationPoints;

    @JsonDeserialize(keyUsing = PointIdKeyDeserializer.class)
    private final Map<PointId, Double> scheinExamResults;

    StudentResponseDTO() {
        this(new Student());
    }

    public StudentResponseDTO(final Student student) {
        super(student.getId(), student.getLastname(), student.getFirstname());

        this.matriculationNo = student.getMatriculationNo();
        this.email = student.getEmail();
        this.courseOfStudies = student.getCourseOfStudies();

        this.team = Optional
                .ofNullable(student.getTeam().isPresent() ? student.getTeam().get().getId() : null);

        this.tutorial = student.getTutorial().getId();
        this.attendance = new HashMap<>(student.getAttendance());
        this.points = new HashMap<>(student.getPointsOfStudent());
        this.presentationPoints = new HashMap<>(student.getPresentationPoints());
        this.scheinExamResults = new HashMap<>(student.getScheinExamResults());
    }
}
