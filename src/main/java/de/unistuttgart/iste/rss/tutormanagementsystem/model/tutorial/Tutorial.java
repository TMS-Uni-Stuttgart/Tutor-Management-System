package de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial;

import java.time.Instant;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import org.springframework.lang.Nullable;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.HasId;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.Student;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.team.Team;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.User;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

/**
 * Tutorial
 */
@Getter
@Entity
@EqualsAndHashCode(callSuper = true)
public class Tutorial extends HasId {

    public static final Tutorial DUMMYT_TUTORIAL = new Tutorial();

    private int slot;

    @Setter
    @ManyToOne(fetch = FetchType.EAGER, cascade = {})
    @JoinColumn(name = "tutor_id")
    @Nullable
    @Getter(AccessLevel.NONE)
    private User tutor;

    @ElementCollection
    private List<Instant> dates;

    private LocalTime startTime;
    private LocalTime endTime;

    @ElementCollection
    private List<User> correctors;

    @OneToMany(targetEntity = Student.class, mappedBy = "tutorial")
    private List<Student> students;

    @OneToMany(targetEntity = Team.class, mappedBy = "tutorial")
    private List<Team> teams;

    @ElementCollection(fetch = FetchType.EAGER)
    @Column(length = 16)
    private Map<Instant, UUID> substitutes;

    protected Tutorial() {
        this(UUID.randomUUID(), -1, null, new ArrayList<>(), LocalTime.now(), LocalTime.now(),
                new ArrayList<>(), new ArrayList<>(), new ArrayList<>());
    }

    public Tutorial(final UUID id, final int slot, final User tutor, final List<Instant> dates,
            final LocalTime startTime, final LocalTime endTime, final List<User> correctors) {
        this(id, slot, tutor, dates, startTime, endTime, correctors, new ArrayList<>(),
                new ArrayList<>());
    }

    public Tutorial(final UUID id, final int slot, final User tutor, final List<Instant> dates,
            final LocalTime startTime, final LocalTime endTime, final List<User> correctors,
            final List<Student> students, final List<Team> teams) {
        super(id);

        this.slot = slot;
        this.tutor = tutor;
        this.students = students;
        this.dates = dates;
        this.startTime = startTime;
        this.endTime = endTime;
        this.teams = teams;

        this.correctors = new ArrayList<>(correctors);
        this.substitutes = new HashMap<>();
    }

    public Tutorial(final Tutorial tutorial) {
        this(tutorial.getId(), tutorial.getSlot(), tutorial.tutor, tutorial.getDates(),
                tutorial.getStartTime(), tutorial.getEndTime(), tutorial.getCorrectors(),
                tutorial.getStudents(), tutorial.getTeams());

        this.substitutes = tutorial.getSubstitutes();
    }

    public Optional<User> getTutor() {
        return Optional.ofNullable(this.tutor);
    }

    public void setSubstituteTutor(final Instant date, final User tutor) {
        this.substitutes.put(date, tutor.getId());
    }

    public void removeSubstituteTutor(final Instant date) {
        this.substitutes.remove(date);
    }
}
