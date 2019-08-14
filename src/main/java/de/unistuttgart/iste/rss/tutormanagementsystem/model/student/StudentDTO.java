package de.unistuttgart.iste.rss.tutormanagementsystem.model.student;

import java.util.Optional;
import java.util.UUID;
import org.springframework.lang.Nullable;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.Tutorial;
import lombok.Getter;

/**
 * CreateStudentDTO
 */
@Getter
public class StudentDTO {

    private final String lastname;
    private final String firstname;
    private final String matriculationNo;
    private final String email;
    private final String courseOfStudies;
    private final Optional<UUID> team;
    private final UUID tutorial;

    StudentDTO() {
        this("", "", "", "", "", null, Tutorial.DUMMYT_TUTORIAL.getId());
    }

    public StudentDTO(final String lastname, final String firstname, final String matriculationNo,
            @Nullable final UUID team, final UUID tutorial) {
        this(lastname, firstname, matriculationNo, "", "", team, tutorial);
    }

    public StudentDTO(final String lastname, final String firstname, final String matriculationNo,
            final String email, final String courseOfStudies, @Nullable final UUID team,
            final UUID tutorial) {
        this.lastname = lastname;
        this.firstname = firstname;
        this.matriculationNo = matriculationNo;
        this.email = email;
        this.courseOfStudies = courseOfStudies;
        this.team = Optional.ofNullable(team);
        this.tutorial = tutorial;
    }

}
