package de.unistuttgart.iste.rss.tutormanagementsystem.dao;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Repository;
import de.unistuttgart.iste.rss.tutormanagementsystem.dao.model.StudentDao;
import de.unistuttgart.iste.rss.tutormanagementsystem.dao.repositories.AttendanceRepository;
import de.unistuttgart.iste.rss.tutormanagementsystem.dao.repositories.StudentRepository;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.Student;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.attendance.Attendance;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.attendance.AttendanceId;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;

/**
 * StudentDataAccessService
 */
@Repository
public class StudentDataAccessService implements StudentDao {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Override
    public List<Student> getAllStudents() {
        List<Student> studentsList = new ArrayList<>();
        studentRepository.findAll().forEach(user -> studentsList.add(user));

        return studentsList;
    }

    @Override
    public Student saveStudent(final Student student) {
        return studentRepository.save(student);
    }

    @Override
    public Student getStudent(UUID id) throws ElementNotFoundException {
        Optional<Student> student = studentRepository.findById(id);

        if (student.isEmpty()) {
            throw new ElementNotFoundException("Student entity was not found.");
        }

        return student.get();
    }

    @Override
    public void deleteStudent(UUID id) throws ElementNotFoundException {
        try {
            studentRepository.deleteById(id);
        } catch (EmptyResultDataAccessException e) {
            throw new ElementNotFoundException();
        }
    }

    @Override
    public Attendance saveAttendance(final Attendance attendance) {
        return attendanceRepository.save(attendance);
    }

    @Override
    public Attendance getAttendance(final AttendanceId id) {
        return attendanceRepository.getOne(id);
    }
}
