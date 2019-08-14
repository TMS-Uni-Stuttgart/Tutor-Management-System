package de.unistuttgart.iste.rss.tutormanagementsystem.model.scheincriteria;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Getter;

/**
 * CreateScheinCriteriaDTO
 */
@Getter
public class ScheinCriteriaDTO {

    private String identifier;
    private JsonNode data;

}
