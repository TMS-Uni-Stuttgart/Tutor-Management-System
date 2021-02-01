declare module 'mongoose-autopopulate' {
    import { Schema } from 'mongoose';

    function mongooseAutoPopulate(schema: Schema): void;

    export default mongooseAutoPopulate;
}
