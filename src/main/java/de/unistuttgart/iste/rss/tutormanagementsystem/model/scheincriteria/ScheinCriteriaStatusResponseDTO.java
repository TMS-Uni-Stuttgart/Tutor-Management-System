package de.unistuttgart.iste.rss.tutormanagementsystem.model.scheincriteria;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import lombok.Getter;

/**
 * ScheinCriteriaStatusResponseDTO
 */
@Getter
public class ScheinCriteriaStatusResponseDTO {

    private final UUID id;

    private final String identifier;

    private final String name;

    private final double achieved;

    private final double total;

    @Enumerated(EnumType.STRING)
    private ScheinCriteriaUnit unit;

    private final boolean isPassed;

    private final Map<UUID, ScheinCriteriaAdditionalStatusResponseDTO> infos;

    public ScheinCriteriaStatusResponseDTO(UUID id, String identifier, String name,
            final double achieved, final double total, ScheinCriteriaUnit unit, boolean isPassed,
            final Map<UUID, ScheinCriteriaAdditionalStatusResponseDTO> infos) {
        this.id = id;
        this.identifier = identifier;
        this.name = name;
        this.achieved = achieved;
        this.total = total;
        this.unit = unit;
        this.isPassed = isPassed;
        this.infos = new HashMap<>(infos);
    }

    public ScheinCriteriaStatusResponseDTO(UUID id, String identifier, String name,
            final double achieved, final double total, ScheinCriteriaUnit unit, boolean isPassed) {
        this.id = id;
        this.identifier = identifier;
        this.name = name;
        this.achieved = achieved;
        this.total = total;
        this.unit = unit;
        this.isPassed = isPassed;
        this.infos = new HashMap<>();
    }
}
