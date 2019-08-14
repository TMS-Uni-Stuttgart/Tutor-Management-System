package de.unistuttgart.iste.rss.tutormanagementsystem.model;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;

/**
 * Abstraction of objects which hold a {@link UUID} as identifier. The ID comes with some
 * configurations for the database.
 */
@Getter
@AllArgsConstructor
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@EqualsAndHashCode
public abstract class HasId {
    @Id
    @Column(columnDefinition = "BINARY(16)")
    private final UUID id;

    public static List<UUID> convertToListOfUUIDs(final List<? extends HasId> entitiesWithId) {
        return entitiesWithId.stream().map(tutorial -> tutorial.getId())
                .collect(Collectors.toList());
    }
}
