package de.unistuttgart.iste.rss.tutormanagementsystem.encrypter;

import java.security.Key;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import javax.persistence.AttributeConverter;
import javax.persistence.Converter;
import org.springframework.beans.factory.annotation.Autowired;
import de.unistuttgart.iste.rss.tutormanagementsystem.config.EnvironmentVariable;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.EnvironmentService;

/**
 * UserConverter
 */
@Converter
public class StringAttibuteEncrypter implements AttributeConverter<String, String> {

    @Autowired
    private EnvironmentService environmentService;

    @Override
    public String convertToDatabaseColumn(final String attribute) {
        if (attribute == null) {
            return null;
        }

        Key key = new SecretKeySpec(getKey(), "AES");

        try {
            Cipher c = Cipher.getInstance(getAlgorithm());
            c.init(Cipher.ENCRYPT_MODE, key);
            return Base64.getEncoder().encodeToString(c.doFinal(attribute.getBytes()));
        } catch (Exception e) {
            throw new RuntimeException("Could not encrypt attribute.");
        }
    }

    @Override
    public String convertToEntityAttribute(final String dbData) {
        if (dbData == null) {
            return null;
        }

        Key key = new SecretKeySpec(getKey(), "AES");

        try {
            Cipher c = Cipher.getInstance(getAlgorithm());
            c.init(Cipher.DECRYPT_MODE, key);
            return new String(c.doFinal(Base64.getDecoder().decode(dbData)));
        } catch (Exception e) {
            throw new RuntimeException("Could not encrypt attribute.");
        }
    }

    private String getAlgorithm() {
        return "AES/ECB/PKCS5Padding";
    }

    private byte[] getKey() {
        final String key =
                environmentService.getProperty(EnvironmentVariable.TMS_DB_ENCRYPTION_KEY);

        if (key == null) {
            throw new IllegalStateException(
                    "The required environment variable \"TMS_DB_ENCRYPTION_KEY\" is not set.");
        }

        return key.getBytes();
    }
}
