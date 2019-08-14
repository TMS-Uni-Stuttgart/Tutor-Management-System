package de.unistuttgart.iste.rss.tutormanagementsystem.dao.model;

import java.util.List;
import java.util.UUID;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.Student;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.attendance.Attendance;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.attendance.AttendanceId;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;

/**
 * StudentDao
 */
public interface StudentDao {

    public List<Student> getAllStudents();

    public Student saveStudent(Student student);

    public Student getStudent(UUID id) throws ElementNotFoundException;

    public void deleteStudent(UUID id) throws ElementNotFoundException;

    public Attendance saveAttendance(final Attendance attendance);

    public Attendance getAttendance(final AttendanceId id);

    // public void setMatriculationNo(final String matriculationNo) throws ElementNotFoundException;

    // public void setTeam(final Team team) throws ElementNotFoundException;

    // public void setTutorial(final Tutorial tuorial) throws ElementNotFoundException;

}
