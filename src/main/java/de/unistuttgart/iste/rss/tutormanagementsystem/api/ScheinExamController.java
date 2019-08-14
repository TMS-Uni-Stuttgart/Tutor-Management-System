package de.unistuttgart.iste.rss.tutormanagementsystem.api;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.scheinexam.ScheinExamDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.scheinexam.ScheinExamResponseDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.ScheinExamService;


/**
 * ScheinExamController
 */
@RestController
@RequestMapping(path = "/api/scheinexam")
public class ScheinExamController {

    @Autowired
    private ScheinExamService scheinExamService;

    @GetMapping
    public List<ScheinExamResponseDTO> getAllScheinExams() {
        var allExams = scheinExamService.getAllScheinExams();

        return allExams.stream().map(exam -> new ScheinExamResponseDTO(exam))
                .collect(Collectors.toList());
    }

    @PostMapping
    @ResponseStatus(code = HttpStatus.CREATED)
    public ScheinExamResponseDTO createScheinExam(@RequestBody ScheinExamDTO examDTO) {
        return new ScheinExamResponseDTO(scheinExamService.createScheinExam(examDTO));
    }

    @PatchMapping(path = "{id}")
    public ScheinExamResponseDTO updateScheinExam(@PathVariable UUID id,
            @RequestBody ScheinExamDTO examDTO) throws ElementNotFoundException {

        return new ScheinExamResponseDTO(scheinExamService.updateScheinExam(id, examDTO));
    }

    @DeleteMapping(path = "{id}")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public void deleteScheinExam(@PathVariable UUID id) throws ElementNotFoundException {
        scheinExamService.deleteScheinExam(id);
    }
}
