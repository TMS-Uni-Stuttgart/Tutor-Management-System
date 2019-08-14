package de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.model;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.annotations.IsScheinCriteria;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.annotations.ScheinCriteriaIgnore;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.scheincriteria.ScheinCriteria;
import lombok.Getter;

/**
 * Contains all information for one {@link IsScheinCriteria} class. It saves the corresponding class
 * aswell as the information about all fields in this class which are relevant for the form (ie not
 * included with {@link ScheinCriteriaIgnore}).
 */
@Getter
public class ScheinCriteriaForm {

    private final Class<? extends ScheinCriteria> relatedClass;
    private final Map<String, FormFieldData> formDataSet;

    public ScheinCriteriaForm(final Class<? extends ScheinCriteria> relatedClass) {
        this.relatedClass = relatedClass;
        this.formDataSet = new HashMap<>();
    }

    /**
     * Adds the {@link FormFieldData} of the field saved by the given name. If there's already saved
     * data with the given name the old data will be overriden.
     * 
     * @param name Name of the field.
     * @param data FormFieldData corresponding to the field.
     */
    public void put(final String name, final FormFieldData data) {
        formDataSet.put(name, data);
    }

    /**
     * Returns the corresponding {@link FormFieldData} saved under the given name. Will be empty if
     * no such data is found.
     * 
     * @param name Name of the field to get the data of.
     * @return Contains either the FormFieldData saved under the name or is empty if there's none
     *         saved.
     */
    public Optional<FormFieldData> get(final String name) {
        return Optional.ofNullable(formDataSet.get(name));
    }
}
