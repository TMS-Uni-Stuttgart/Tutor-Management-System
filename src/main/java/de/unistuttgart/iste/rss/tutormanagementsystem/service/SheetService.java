package de.unistuttgart.iste.rss.tutormanagementsystem.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import de.unistuttgart.iste.rss.tutormanagementsystem.dao.model.SheetDao;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.ExerciseDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.SheetDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.Exercise;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.Sheet;

/**
 * SheetService
 */
@Service
public class SheetService {

    @Autowired
    private SheetDao sheetDao;

    public Sheet createSheet(final SheetDTO sheetDTO) {
        List<Exercise> exercises = new ArrayList<>();

        for (ExerciseDTO ex : sheetDTO.getExercises()) {
            exercises.add(new Exercise(ex.getExNo(), ex.getMaxPoints(),
                    sheetDTO.isBonusSheet() ? true : ex.isBonus()));
        }

        Sheet sheet = new Sheet(UUID.randomUUID(), sheetDTO.getSheetNo(), exercises,
                sheetDTO.isBonusSheet());

        return sheetDao.saveSheet(sheet);
    }

    public Sheet getSheet(final UUID id) throws ElementNotFoundException {
        return sheetDao.getSheet(id);
    }

    public List<Sheet> getAllSheets() {
        return sheetDao.getAllSheets();
    }

    public void deleteSheet(final UUID id) throws ElementNotFoundException {
        sheetDao.deleteSheet(id);
    }

    public Sheet updateSheet(final UUID id, final SheetDTO updatedSheet)
            throws ElementNotFoundException {
        Sheet sheet = getSheet(id);
        List<Exercise> exercises = new ArrayList<>();

        for (ExerciseDTO ex : updatedSheet.getExercises()) {
            exercises.add(new Exercise(ex.getExNo(), ex.getMaxPoints(), ex.isBonus()));
        }

        return sheetDao.saveSheet(new Sheet(sheet.getId(), updatedSheet.getSheetNo(), exercises,
                updatedSheet.isBonusSheet()));
    }

}
