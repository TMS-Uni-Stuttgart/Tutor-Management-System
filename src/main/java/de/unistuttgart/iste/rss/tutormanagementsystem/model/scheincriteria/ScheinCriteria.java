package de.unistuttgart.iste.rss.tutormanagementsystem.model.scheincriteria;

import java.util.UUID;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.annotations.ScheinCriteriaIgnore;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.Student;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

/**
 * ScheinCriteria
 */
@Getter
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@EqualsAndHashCode
public abstract class ScheinCriteria {

    @Id
    @Setter
    @Column(columnDefinition = "BINARY(16)")
    @ScheinCriteriaIgnore
    private UUID id;

    @ScheinCriteriaIgnore
    private String name;

    @Setter
    @ScheinCriteriaIgnore
    private String identifier;

    public abstract boolean isPassed(Student student);

    public abstract ScheinCriteriaStatusResponseDTO getStatusDTO(Student student);
}
