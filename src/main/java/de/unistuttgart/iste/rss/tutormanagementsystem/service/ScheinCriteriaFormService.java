package de.unistuttgart.iste.rss.tutormanagementsystem.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Service;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.model.FormFieldData;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.model.ScheinCriteriaForm;

/**
 * Service which is used to handle the different {@link ScheinCriteriaForm}.
 */
@Service
public class ScheinCriteriaFormService {
    private Map<String, ScheinCriteriaForm> scheinCriteriaForms;

    public ScheinCriteriaFormService() {
        scheinCriteriaForms = new HashMap<>();
    }

    public void setCriterias(final Map<String, ScheinCriteriaForm> scheinCriterias) {
        this.scheinCriteriaForms = new HashMap<>(scheinCriterias);
    }

    public Optional<ScheinCriteriaForm> getCriteriaForm(final String identifier) {
        return Optional.ofNullable(scheinCriteriaForms.get(identifier));
    }

    /**
     * Special map that maps the criteria identifiers to their form data.
     * 
     * The generated map excludes anything from the {@link ScheinCriteriaForm} except the form data.
     * These datas are mapped to the identifiers of the corresponding criteria.
     * 
     * @return Map with form data (mapped by criteria identifiers)
     */
    public Map<String, Map<String, FormFieldData>> getFormData() {
        Map<String, Map<String, FormFieldData>> formData = new HashMap<>();

        for (var entry : scheinCriteriaForms.entrySet()) {
            formData.put(entry.getKey(), entry.getValue().getFormDataSet());
        }

        return formData;
    }

}
