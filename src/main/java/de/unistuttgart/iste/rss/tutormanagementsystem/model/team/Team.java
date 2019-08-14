package de.unistuttgart.iste.rss.tutormanagementsystem.model.team;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.HasId;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.jsonconverter.PointIdKeyDeserializer;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.Exercise;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.HasPoints;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.PointId;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.Sheet;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.Student;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.Tutorial;
import lombok.Getter;
import lombok.NonNull;

/**
 * Model class which holds all information about a particular team and servers as an {@link Entity}
 * to save that team in the database.
 */
@Entity
@Getter
public class Team extends HasId implements HasPoints {

    private int teamNo;

    @ManyToOne
    private Tutorial tutorial;

    @OneToMany(mappedBy = "team", fetch = FetchType.EAGER)
    private @NonNull List<Student> students;

    @JsonDeserialize(keyUsing = PointIdKeyDeserializer.class)
    @ElementCollection
    private Map<PointId, Double> points;

    public Team() {
        this(UUID.randomUUID(), Tutorial.DUMMYT_TUTORIAL, -1, new ArrayList<>());
    }

    public Team(final UUID id, final Tutorial tutorial, final int teamNo,
            final List<Student> students) {
        super(id);

        this.teamNo = teamNo;
        this.tutorial = tutorial;
        this.students = students;

        this.points = new HashMap<>();
    }


    @Override
    public void setPoints(final Sheet sheet, final Exercise exercise, final double points) {
        PointId id = new PointId(sheet, exercise);
        this.points.put(id, points);
    }

    @Override
    public boolean hasPoints(final Sheet sheet, final Exercise exercise) {
        return hasPoints(new PointId(sheet, exercise));
    }

    private boolean hasPoints(final PointId id) {
        return this.points.containsKey(id);
    }

    @Override
    public Optional<Double> getPoints(final Sheet sheet, final Exercise exercise) {
        PointId id = new PointId(sheet, exercise);

        return Optional.ofNullable(this.points.get(id));
    }
}
