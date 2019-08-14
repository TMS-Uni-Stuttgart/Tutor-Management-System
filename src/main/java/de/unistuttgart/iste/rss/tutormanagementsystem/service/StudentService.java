package de.unistuttgart.iste.rss.tutormanagementsystem.service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import javax.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import de.unistuttgart.iste.rss.tutormanagementsystem.dao.model.StudentDao;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.attendance.Attendance;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.attendance.AttendanceDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.Exercise;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.PointId;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.PresentationPointsDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.Sheet;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.UpdatePointsDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.scheincriteria.ScheinCriteria;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.scheincriteria.ScheinCriteriaStatusResponseDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.scheincriteria.ScheinCriteriaSummaryResponseDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.scheinexam.ScheinExam;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.Student;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.StudentDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.team.Team;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.Tutorial;

/**
 * StudentService
 */
@Service
public class StudentService {

    @Autowired
    private StudentDao studentDao;

    @Autowired
    private TutorialService tutorialService;

    @Autowired
    private TeamService teamService;

    @Autowired
    private SheetService sheetService;

    @Autowired
    private ScheinExamService scheinExamService;

    @Autowired
    private ScheinCriteriaService scheinCriteriaService;

    public List<Student> getAllStudents() {
        return studentDao.getAllStudents();
    }

    public Student createStudent(final StudentDTO studentDTO) throws ElementNotFoundException {
        Tutorial tutorial = tutorialService.getTutorial(studentDTO.getTutorial());
        Team team = getTeamOfDTO(tutorial.getId(), studentDTO);

        Student studentCreated =
                studentDao.saveStudent(new Student(UUID.randomUUID(), studentDTO.getLastname(),
                        studentDTO.getFirstname(), studentDTO.getMatriculationNo(),
                        studentDTO.getEmail(), studentDTO.getCourseOfStudies(), team, tutorial));

        return studentCreated;
    }

    public Student getStudent(final UUID id) throws ElementNotFoundException {
        return studentDao.getStudent(id);
    }

    public void deleteStudent(final UUID id) throws ElementNotFoundException {
        Student student = getStudent(id);

        studentDao.deleteStudent(id);

        if (student.getTeam().isPresent()) {
            deleteStudentFromTeam(student.getTeam().get(), student);
        }

    }

    /**
     * Deletes a student from team and deletes the team if it is empty now.
     * 
     * @param team Team to delete student from
     * @param student Student to delete
     * @throws ElementNotFoundException
     */
    private void deleteStudentFromTeam(final Team team, final Student student)
            throws ElementNotFoundException {
        team.getStudents().remove(student);

        List<Student> students = team.getStudents();

        if (students.isEmpty()) {
            teamService.deleteTeam(team.getTutorial().getId(), team.getId());
        }
    }

    public Attendance setAttendance(final UUID id, final AttendanceDTO attendanceDTO)
            throws ElementNotFoundException {
        Student student = getStudent(id);
        Instant date = attendanceDTO.getDate();
        Optional<String> note = attendanceDTO.getNote();
        Attendance attendance =
                new Attendance(id, date, attendanceDTO.getState().orElseGet(() -> null),
                        note.isPresent() ? note.get() : null);

        student.setAttendanceState(date, attendance);

        Attendance savedAttendance = studentDao.saveAttendance(attendance);
        studentDao.saveStudent(student);

        return savedAttendance;
    }

    /**
     * Sets the team of the student to the given one. <br />
     * The new team of the student which the given ID will be the given team. If the student had a
     * previous team all points of that team will get copied over to the student.
     * 
     * @param id ID of the student
     * @param team New team of the student
     * @throws ElementNotFoundException
     */
    public Student setTeam(final UUID id, final Team team) throws ElementNotFoundException {
        Student student = getStudent(id);
        Optional<Team> previousTeam = student.getTeam();

        if (previousTeam.isPresent() && !previousTeam.get().equals(team)) {
            student.movePointsFromTeamToStudent();
        }

        student.setTeam(team);

        return studentDao.saveStudent(student);
    }

    /**
     * Removes the team from the given student. <br />
     * The student with the given ID won't have a team afterwards. However if it had a team at the
     * beginning all points are copied from the team to student itself.
     * 
     * @param id ID of the student which team to remove.
     * @throws ElementNotFoundException
     */
    public void removeTeam(final UUID id) throws ElementNotFoundException {
        Student student = getStudent(id);
        Optional<Team> team = student.getTeam();

        if (team.isPresent()) {
            student.movePointsFromTeamToStudent();
        }

        student.setTeam(null);

        studentDao.saveStudent(student);

        if (team.isPresent()) {
            deleteStudentFromTeam(team.get(), student);
        }
    }

    public Student updateStudent(final UUID id, final @Valid StudentDTO updatedStudentDTO)
            throws ElementNotFoundException {
        Student student = getStudent(id);
        Tutorial tutorial = tutorialService.getTutorial(updatedStudentDTO.getTutorial());
        Team team = getTeamOfDTO(student.getTutorial().getId(), updatedStudentDTO);

        if (!student.getTutorial().getId().equals(updatedStudentDTO.getTutorial())) {
            student.movePointsFromTeamToStudent();
            team = null;
        }

        Student updatedStudent = new Student(student.getId(), updatedStudentDTO.getLastname(),
                updatedStudentDTO.getFirstname(), updatedStudentDTO.getMatriculationNo(),
                updatedStudentDTO.getEmail(), updatedStudentDTO.getCourseOfStudies(), team,
                tutorial, student.getAttendance(), student.getPoints(),
                student.getPresentationPoints(), student.getScheinExamResults());

        return studentDao.saveStudent(updatedStudent);
    }

    public Optional<Team> getTeamOfStudent(final UUID id) throws ElementNotFoundException {
        Student student = getStudent(id);

        return student.getTeam();
    }

    /**
     * Sets the points of the student with the given ID according to the passed information. <br />
     * <ul>
     * <li>If the {@link UpdatePointsDTO} includes exercises for which the student has already saved
     * points the old ones will get overwritten.</li>
     * <li>If the {@link UpdatePointsDTO} includes {@link Exercise}s which are not present in the
     * {@link Sheet} these exercises will get ignored.</li>
     * </ul>
     * 
     * @param id ID of the student.
     * @param points Information about the new points.
     * @throws ElementNotFoundException
     */
    public void setPoints(final UUID id, final UpdatePointsDTO points)
            throws ElementNotFoundException {
        Student student = getStudent(id);
        Sheet sheet = sheetService.getSheet(points.getId());

        for (var entry : points.getExercises().entrySet()) {
            Optional<Exercise> exercise = sheet.getExercises().stream()
                    .filter(e -> entry.getKey().equals(e.getExNo())).findFirst();

            if (exercise.isPresent()) {
                student.setPoints(sheet, exercise.get(), entry.getValue());
            }
        }

        studentDao.saveStudent(student);
    }

    /**
     * Returns the points of the given student.
     * 
     * @param id ID of the student.
     * @return Points of the student.
     * @throws ElementNotFoundException
     */
    public Map<PointId, Double> getPoints(final UUID id) throws ElementNotFoundException {
        Student student = getStudent(id);

        return student.getPointsOfStudent();
    }

    public void setPresentationPoints(final UUID id, final PresentationPointsDTO points)
            throws ElementNotFoundException {
        if (points.getPoints() < 0) {
            throw new IllegalArgumentException("Points have to be 0 or bigger.");
        }

        Student student = getStudent(id);
        Sheet sheet = sheetService.getSheet(points.getSheetId());

        student.setPresentationPoints(sheet.getId(), points.getPoints());

        studentDao.saveStudent(student);
    }

    /**
     * Returns the presentation points for the student.
     * 
     * @param id ID of the student
     * @return Presentation points of the student.
     * @throws ElementNotFoundException
     */
    public Map<UUID, Double> getPresentationPoints(final UUID id) throws ElementNotFoundException {
        Student student = getStudent(id);

        return student.getPresentationPoints();
    }

    /**
     * Sets the ScheinExamResults of the student with the given ID according to the passed
     * information. <br />
     * <ul>
     * <li>If the {@link UpdatePointsDTO} includes exercises for which the student has already saved
     * points the old ones will get overwritten.</li>
     * <li>If the {@link UpdatePointsDTO} includes {@link Exercise}s which are not present in the
     * {@link ScheinExam} these exercises will get ignored.</li>
     * </ul>
     * 
     * @param id
     * @param result
     * @throws ElementNotFoundException
     */
    public void setScheinExamResults(UUID id, UpdatePointsDTO result)
            throws ElementNotFoundException {
        Student student = getStudent(id);
        ScheinExam scheinExam = scheinExamService.getScheinExam(result.getId());

        for (var entry : result.getExercises().entrySet()) {
            Optional<Exercise> exercise = scheinExam.getExercises().stream()
                    .filter(e -> entry.getKey().equals(e.getExNo())).findFirst();

            if (exercise.isPresent()) {
                student.setScheinExamResults(scheinExam, exercise.get(), entry.getValue());
            }
        }

        studentDao.saveStudent(student);
    }

    /**
     * Returns the exam results of the given student.
     * 
     * @param id ID of the student
     * @return Points of the student
     * @throws ElementNotFoundException
     */
    public Map<PointId, Double> getScheinExamResults(final UUID id)
            throws ElementNotFoundException {
        Student student = getStudent(id);

        return student.getScheinExamResults();
    }

    /**
     * @param studentDTO DTO to get the team of.
     * @return Team of the studentDTO if there is one. If there is not a team {@code null} will be
     *         returned.
     */
    private Team getTeamOfDTO(final UUID tutorialId, final StudentDTO studentDTO)
            throws ElementNotFoundException {
        if (studentDTO.getTeam().isPresent()) {
            return teamService.getTeam(tutorialId, studentDTO.getTeam().get());
        }

        return null;
    }

    public ScheinCriteriaSummaryResponseDTO getScheinCriteriaSummaryOfStudent(UUID id)
            throws ElementNotFoundException {
        Map<UUID, ScheinCriteriaStatusResponseDTO> scheinCriteriaSummary = new HashMap<>();
        Student student = this.getStudent(id);
        boolean isPassed = true;

        for (ScheinCriteria scheinCriteria : scheinCriteriaService.getAllCriterias()) {
            scheinCriteriaSummary.put(scheinCriteria.getId(), scheinCriteria.getStatusDTO(student));
            if (!scheinCriteria.isPassed(student)) {
                isPassed = false;
            }
        }

        return new ScheinCriteriaSummaryResponseDTO(scheinCriteriaSummary, isPassed);
    }


}
