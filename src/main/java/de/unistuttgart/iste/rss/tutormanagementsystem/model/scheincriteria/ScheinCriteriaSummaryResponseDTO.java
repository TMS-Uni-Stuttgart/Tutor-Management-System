package de.unistuttgart.iste.rss.tutormanagementsystem.model.scheincriteria;

import java.util.Map;
import java.util.UUID;
import lombok.Getter;

/**
 * DTO which includes a date and the corresponding points for that date.
 */
@Getter
public class ScheinCriteriaSummaryResponseDTO {

    private Map<UUID, ScheinCriteriaStatusResponseDTO> scheinCriteriaSummary;

    private boolean passed;

    ScheinCriteriaSummaryResponseDTO() {}

    public ScheinCriteriaSummaryResponseDTO(
            Map<UUID, ScheinCriteriaStatusResponseDTO> scheinCriteriaSummary, boolean passed) {
        this.scheinCriteriaSummary = scheinCriteriaSummary;
        this.passed = passed;
    }
}
