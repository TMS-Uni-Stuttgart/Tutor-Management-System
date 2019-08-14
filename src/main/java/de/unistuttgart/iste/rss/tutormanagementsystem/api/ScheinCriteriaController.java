package de.unistuttgart.iste.rss.tutormanagementsystem.api;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.model.FormFieldData;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.model.ScheinCriteriaForm;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.scheincriteria.ScheinCriteria;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.scheincriteria.ScheinCriteriaDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.scheincriteria.ScheinCriteriaSummaryResponseDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.Student;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.ScheinCriteriaFormService;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.ScheinCriteriaService;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.StudentService;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.TutorialService;

/**
 * ScheinCriteriaController
 */
@RestController
@RequestMapping(path = "/api/scheincriteria")
public class ScheinCriteriaController {

    @Autowired
    private ScheinCriteriaService scheinCriteriaService;

    @Autowired
    private ScheinCriteriaFormService scheinFormService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private TutorialService tutorialService;

    @Autowired
    private ObjectMapper jacksonObjectMapper;

    @GetMapping
    @ResponseBody
    private List<ScheinCriteria> getAllCriterias() {
        return scheinCriteriaService.getAllCriterias();
    }

    @DeleteMapping(path = "{id}")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public void deleteCriteria(@PathVariable UUID id) throws ElementNotFoundException {
        scheinCriteriaService.deleteCriteria(id);
    }

    @PostMapping
    @ResponseBody
    @ResponseStatus(code = HttpStatus.CREATED)
    private ScheinCriteria createCriteria(@RequestBody final ScheinCriteriaDTO criteriaDTO)
            throws JsonProcessingException {

        return scheinCriteriaService.createCriteria(generateCriteriaFromDTO(criteriaDTO));
    }

    @PatchMapping(path = "{id}")
    @ResponseBody
    private ScheinCriteria updateCriteria(@PathVariable UUID id,
            @RequestBody ScheinCriteriaDTO updatedCriteria)
            throws JsonProcessingException, ElementNotFoundException {
        return scheinCriteriaService.replaceCriteria(id, generateCriteriaFromDTO(updatedCriteria));
    }

    @GetMapping(path = "/form")
    @ResponseBody
    private Map<String, Map<String, FormFieldData>> getCriterias() {
        return scheinFormService.getFormData();
    }

    @GetMapping(path = "student")
    public Map<UUID, ScheinCriteriaSummaryResponseDTO> getCriteriaSummaryOfAllStudents()
            throws ElementNotFoundException {
        var students = studentService.getAllStudents();
        Map<UUID, ScheinCriteriaSummaryResponseDTO> summaries = new HashMap<>();

        for (Student student : students) {
            var studentId = student.getId();
            summaries.put(studentId, studentService.getScheinCriteriaSummaryOfStudent(studentId));
        }

        return summaries;
    }

    @GetMapping(path = "tutorial")
    public Map<String, List<ScheinCriteriaSummaryResponseDTO>> getScheinCriteriaResultsOfAllStudentsWithTutorialSlots()
            throws ElementNotFoundException {
        var tutorials = tutorialService.getAllTutorials();
        Map<String, List<ScheinCriteriaSummaryResponseDTO>> results = new HashMap<>();

        for (var tutorial : tutorials) {
            var students = tutorialService.getStudentsOfTutorial(tutorial.getId());
            ArrayList<ScheinCriteriaSummaryResponseDTO> summaries = new ArrayList<>();
            for (var student : students) {
                summaries.add(studentService.getScheinCriteriaSummaryOfStudent(student.getId()));
            }
            results.put(Integer.toString(tutorial.getSlot()), summaries);
        }

        return results;
    }

    private ScheinCriteria generateCriteriaFromDTO(final ScheinCriteriaDTO criteriaDTO)
            throws JsonProcessingException {
        final String identifier = criteriaDTO.getIdentifier();
        final Optional<ScheinCriteriaForm> criteriaForm =
                scheinFormService.getCriteriaForm(identifier);

        if (criteriaForm.isEmpty()) {
            throw new IllegalArgumentException(
                    String.format("No class found for identifier \"%s\".", identifier));
        }

        final Class<? extends ScheinCriteria> criteriaFormClass =
                criteriaForm.get().getRelatedClass();
        final ScheinCriteria criteria =
                jacksonObjectMapper.treeToValue(criteriaDTO.getData(), criteriaFormClass);

        criteria.setIdentifier(identifier);

        return criteria;
    }

}
