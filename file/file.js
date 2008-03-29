/**
 * File object
 * contains multiple useful static functions
 * @author Dana Spiegel dana@10gen.com
 */
 
file.File = function() {};

file.File.upload = function(file) {
    if (file) {
        db._files.save(file);
        return file._id;
    }
    return null;
}