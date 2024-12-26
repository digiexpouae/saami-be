export default class DatabaseService {
    constructor(dbSchema) {
        this.model = dbSchema;
    }

   
    async save(data) {
        const savedData = await this.model.create(data);
        return savedData;
    }

    
    async saveMany(data) {
        const documents = await this.model.insertMany(data);
        return documents;
    }

    
    async getDocument(query, options = {}) {
        const { populate } = options;
        let customQuery = this.model.findOne(query);

        if (populate) {
            customQuery = customQuery.populate(populate);
        }

        return await customQuery.exec();
    }

    
    async getAllDocuments(query, options = {}) {
        const { 
            limit = 10, 
            sort = 'createdAt', 
            skip = 0, 
            populate, 
            isDeleted = false 
        } = options;

        // Modify query to handle soft delete
        const updatedQuery = { 
            ...(options.hasOwnProperty('isDeleted') ? { isDeleted } : {}),
            ...query 
        };

        let customQuery = this.model.find(updatedQuery);

        // Pagination
        if (skip !== "" && limit !== "") {
            customQuery = customQuery.limit(Number(limit)).skip(Number(skip));
        }

        // Sorting
        customQuery = customQuery.sort({ [sort]: -1 });

        // Population
        if (populate) {
            customQuery = customQuery.populate(populate);
        }

        return await customQuery.exec();
    }

    // Update a document
    async updateDocument(filter, data, options = { new: true }) {
        const { populate, ...updateOptions } = options;

        let updatedDocument = await this.model.findOneAndUpdate(
            filter, 
            data, 
            { 
                ...updateOptions,
                new: true 
            }
        );

        // Populate if requested
        if (populate && updatedDocument) {
            updatedDocument = await updatedDocument.populate(populate);
        }

        return updatedDocument;
    }

    // Delete a document (soft or hard delete)
    async deleteDocument(filter, hardDelete = false) {
        if (hardDelete) {
            // Permanent deletion
            return await this.model.findOneAndDelete(filter);
        } else {
            // Soft delete
            return await this.model.findOneAndUpdate(
                filter, 
                { isDeleted: true }, 
                { new: true }
            );
        }
    }

    // Bulk update
    async updateManyDocuments(filter, update) {
        return await this.model.updateMany(filter, update);
    }

    // Count documents
    async countDocuments(query) {
        return await this.model.countDocuments(query);
    }
};
