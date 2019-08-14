package de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator;

import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import javax.persistence.Transient;
import org.reflections.Reflections;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.annotations.IsScheinCriteria;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.annotations.ScheinCriteriaIgnore;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.annotations.ScheinCriteriaNumber;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.annotations.ScheinCriteriaPercentage;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.annotations.ScheinCriteriaPossiblePercentage;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.model.FormBooleanFieldData;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.model.FormEnumFieldData;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.model.FormFieldData;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.model.FormFloatFieldData;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.model.FormIntegerFieldData;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.model.FormSelectValue;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.model.FormStringFieldData;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.model.ScheinCriteriaForm;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.scheincriteria.ScheinCriteria;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.ScheinCriteriaFormService;

/**
 * Iterates over the classpath and collects all classes marked with {@link IsScheinCriteria}.
 * Generates the corresponding {@link ScheinCriteriaForm} from that class containing all neccessary
 * {@link FormFieldData} information of the fields. If a field is marked with
 * {@link ScheinCriteriaIgnore} or if a field has an unsupported type it will not be added to the
 * {@link ScheinCriteriaForm}.
 * 
 * <p>
 * Will run just after the server is started and the basic configuration is done.
 */
@Component
public class FormGeneratorClasspathItertor implements ApplicationRunner {

    @Autowired
    private ScheinCriteriaFormService scheinCriteriaFormService;

    private final Logger logger = LoggerFactory.getLogger(FormGeneratorClasspathItertor.class);

    @Override
    public void run(ApplicationArguments args) throws Exception {
        Reflections reflections = new Reflections("de.unistuttgart.iste.rss.tutormanagementsystem");
        Set<Class<?>> annotated = reflections.getTypesAnnotatedWith(IsScheinCriteria.class, true);

        Map<String, ScheinCriteriaForm> scheinCriteriaForms = new HashMap<>();

        annotated.forEach(cls -> {
            IsScheinCriteria anno = cls.getAnnotation(IsScheinCriteria.class);

            if (anno == null) {
                logger.error("Class " + cls.getName()
                        + " has no IsScheinCriteria annotation. @Retention of IsScheinCriteria has to be set to RetentionPolicy.RUNTIME");
                return;
            }

            logger.debug("Processing schein criteria: " + anno.identifier() + " -- From class: "
                    + cls.getSimpleName());

            ScheinCriteriaForm formData;

            try {
                Class<? extends ScheinCriteria> formFieldClass =
                        Class.forName(cls.getName()).asSubclass(ScheinCriteria.class);
                formData = new ScheinCriteriaForm(formFieldClass);

            } catch (ClassNotFoundException | ClassCastException e) {
                logger.error(String.format("Could not find class \"%s\" in the classpath.",
                        cls.getName()), e);
                return;
            }

            List<Field> fields = getAllFields(cls);

            for (var field : fields) {
                logger.debug(
                        "Found field: " + field.getName() + " -- " + field.getType().getSimpleName()
                                + " -- Is Enum? " + field.getType().isEnum());

                Optional<FormFieldData> formFieldData = getFormFieldDataForField(field);

                if (formFieldData.isPresent()) {
                    formData.put(field.getName(), formFieldData.get());
                }
            }

            scheinCriteriaForms.put(anno.identifier(), formData);
        });

        scheinCriteriaFormService.setCriterias(scheinCriteriaForms);
        logger.info("Schein criterias parsed.");
    }

    /**
     * Collects all fields of the given class.
     * 
     * Colleacts all fields regardless of visibility of the given class. This includes fields of all
     * super classes (except {@link Object}).
     * 
     * @param cls Class to get fields of
     * @return {@link List} which contains all Fields
     */
    private List<Field> getAllFields(final Class<?> cls) {
        List<Field> fields = new ArrayList<>(Arrays.asList(cls.getDeclaredFields()));

        Class<?> superClass = cls.getSuperclass();
        while (!superClass.equals(Object.class)) {
            logger.debug(String.format("Found super class: \"%s\" -- Adding it's fields aswell.",
                    superClass.getSimpleName()));

            fields.addAll(Arrays.asList(superClass.getDeclaredFields()));
            superClass = superClass.getSuperclass();
        }

        return fields;
    }

    /**
     * Generates the {@link FormFieldData} of the given {@link Field}.
     * 
     * Generates the {@link FormFieldData} of the given {@link Field} depending on it's type. If the
     * type is not supported the returned Optional will be empty. Everytime the FormFieldData is
     * generated a short logging message is added to the log aswell.
     * 
     * @param field Field to generate the FormFieldData for
     * @return Contains either the generated FormFieldData (if the type of the field is supported)
     *         or it's empty.
     */
    private Optional<FormFieldData> getFormFieldDataForField(final Field field) {
        Class<?> fieldType = field.getType();
        FormFieldData fieldData = null;

        if (isIgnoreField(field)) {
            return Optional.empty();
        }

        if (fieldType.equals(String.class)) {
            fieldData = new FormStringFieldData();
            logger.debug(String.format("String field \"%s\" added.", field.getName()));

        } else if (fieldType.equals(boolean.class) || fieldType.equals(Boolean.class)) {
            fieldData = new FormBooleanFieldData();
            logger.debug(String.format("Boolean field \"%s\" added.", field.getName()));

        } else if (fieldType.equals(int.class) || fieldType.equals(Integer.class)) {
            ScheinCriteriaNumber annotation = field.getAnnotation(ScheinCriteriaNumber.class);

            if (annotation != null) {
                fieldData =
                        new FormIntegerFieldData((int) annotation.min(), (int) annotation.max());
            } else {
                fieldData = new FormIntegerFieldData();
            }

            logger.debug(String.format("Integer field \"%s\" added.", field.getName()));

        } else if (fieldType.equals(float.class) || fieldType.equals(Float.class)
                || fieldType.equals(double.class) || fieldType.equals(Double.class)) {

            fieldData = getFormFloatFieldData(field.getAnnotation(ScheinCriteriaNumber.class),
                    field.getAnnotation(ScheinCriteriaPossiblePercentage.class),
                    field.getAnnotation(ScheinCriteriaPercentage.class));

            logger.debug(String.format("Float / Double field \"%s\" added.", field.getName()));

        } else if (fieldType.isEnum()) {
            List<FormSelectValue<String>> enumValues = new ArrayList<>();
            for (var eVal : fieldType.getEnumConstants()) {
                enumValues.add(new FormSelectValue<>(eVal.toString(), eVal.toString()));
            }
            fieldData = new FormEnumFieldData<>(enumValues);
            logger.debug(String.format("Enum field \"%s\" of type \"%s\" added.", field.getName(),
                    fieldType.getSimpleName()));

        } else {
            logger.debug("Field type \"" + field.getType().getSimpleName()
                    + "\" is not supported by the form generator.");
        }

        return Optional.ofNullable(fieldData);
    }

    private boolean isIgnoreField(final Field field) {
        Annotation[] annotations = field.getAnnotations();

        for (var anno : annotations) {
            if (anno.annotationType().equals(ScheinCriteriaIgnore.class)) {
                return true;
            }

            if (anno.annotationType().equals(Autowired.class)) {
                return true;
            }

            if (anno.annotationType().equals(Transient.class)) {
                return true;
            }
        }

        return false;
    }

    private FormFloatFieldData getFormFloatFieldData(final ScheinCriteriaNumber numberConfig,
            final ScheinCriteriaPossiblePercentage possiblePercentageConfig,
            final ScheinCriteriaPercentage percentageConfig) {
        if (numberConfig == null && possiblePercentageConfig == null && percentageConfig == null) {
            return new FormFloatFieldData();
        }

        if (percentageConfig != null) {
            if (numberConfig != null) {
                throw new IllegalStateException(
                        "ScheinCriteriaNumber must not be used together with ScheinCriteriaPercentage.");
            }

            if (possiblePercentageConfig != null) {
                throw new IllegalStateException(
                        "ScheinCriteriaPossiblePercentage must not be used together with ScheinCriteriaPercentage.");
            }

            return new FormFloatFieldData(0, 100, null, true);
        }

        if (numberConfig != null && possiblePercentageConfig == null) {
            return new FormFloatFieldData(numberConfig.min(), numberConfig.max());
        }

        if (possiblePercentageConfig != null && numberConfig == null) {
            return new FormFloatFieldData(possiblePercentageConfig.toggledBy());
        }

        return new FormFloatFieldData(numberConfig.min(), numberConfig.max(),
                possiblePercentageConfig.toggledBy(), false);
    }
}
