package de.unistuttgart.iste.rss.tutormanagementsystem.api;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import javax.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.attendance.Attendance;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.attendance.AttendanceDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.PointId;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.PresentationPointsDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.UpdatePointsDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.scheincriteria.ScheinCriteriaSummaryResponseDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.StudentDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.StudentResponseDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.team.TeamResponseDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.StudentService;

/**
 * {@link RestController} responsible for all student related endpoints.
 */
@RestController
@RequestMapping(path = "/api/student")
@ResponseBody
public class StudentController {

    @Autowired
    private StudentService studentService;

    @GetMapping
    public List<StudentResponseDTO> getAllStudents() {
        var students = studentService.getAllStudents();
        List<StudentResponseDTO> responseList = students.stream()
                .map(student -> new StudentResponseDTO(student)).collect(Collectors.toList());

        return responseList;
    }

    @PostMapping
    @ResponseStatus(code = HttpStatus.CREATED)
    public StudentResponseDTO createStudent(@RequestBody @Valid StudentDTO studentDTO)
            throws ElementNotFoundException {
        return new StudentResponseDTO(studentService.createStudent(studentDTO));
    }

    @GetMapping(path = "{id}")
    public StudentResponseDTO getStudent(@PathVariable UUID id) throws ElementNotFoundException {
        return new StudentResponseDTO(studentService.getStudent(id));
    }

    @PatchMapping(path = "{id}")
    public StudentResponseDTO patchStudent(@PathVariable UUID id,
            @RequestBody @Valid StudentDTO updatedStudent) throws ElementNotFoundException {

        return new StudentResponseDTO(studentService.updateStudent(id, updatedStudent));
    }

    @DeleteMapping(path = "{id}")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public void deleteStudent(@PathVariable UUID id) throws ElementNotFoundException {
        studentService.deleteStudent(id);
    }

    @PutMapping(path = "{id}/attendance")
    public Attendance setAttendanceOfStudent(final @PathVariable UUID id,
            final @RequestBody AttendanceDTO attendance) throws ElementNotFoundException {

        return studentService.setAttendance(id, attendance);
    }

    @PutMapping(path = "{id}/points")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public void setPoints(@PathVariable UUID id, @RequestBody UpdatePointsDTO points)
            throws ElementNotFoundException {
        studentService.setPoints(id, points);
    }

    @GetMapping(path = "{id}/points")
    public Map<PointId, Double> getPoints(@PathVariable UUID id) throws ElementNotFoundException {
        return studentService.getPoints(id);
    }

    @PutMapping(path = "{id}/presentation")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public void setPresentationPoints(@PathVariable UUID id,
            @RequestBody PresentationPointsDTO points) throws ElementNotFoundException {
        studentService.setPresentationPoints(id, points);
    }

    @GetMapping(path = "{id}/presentation")
    public Map<UUID, Double> getPresentationPoints(@PathVariable UUID id)
            throws ElementNotFoundException {
        return studentService.getPresentationPoints(id);
    }

    @PutMapping(path = "{id}/examresult")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public void setScheinExamResults(@PathVariable UUID id, @RequestBody UpdatePointsDTO result)
            throws ElementNotFoundException {
        studentService.setScheinExamResults(id, result);
    }

    @GetMapping(path = "{id}/examresult")
    public Map<PointId, Double> getScheinExamResults(@PathVariable UUID id)
            throws ElementNotFoundException {
        return studentService.getScheinExamResults(id);
    }

    @GetMapping(path = "{id}/team")
    public Optional<TeamResponseDTO> getTeamOfStudent(@PathVariable UUID id)
            throws ElementNotFoundException {
        var team = studentService.getTeamOfStudent(id);

        return Optional.ofNullable(team.isPresent() ? new TeamResponseDTO(team.get()) : null);
    }

    @GetMapping(path = "{id}/scheincriteria")
    public ScheinCriteriaSummaryResponseDTO getCriteriaStatusOfStudent(@PathVariable UUID id)
            throws ElementNotFoundException {

        return studentService.getScheinCriteriaSummaryOfStudent(id);
    }
}
