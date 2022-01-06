const getCollegeDetails = async function (req, res) {
    try {
        res.setHeader('Access-Control-Allow-Origin', '*');
        let body = req.query;
        if (!validator.isValidRequestBody(body)) {
            return res.status(400).send({
                status: false,
                message: "Query not found, Please provide a valid query to fetch details",
            });
        } else {
            let collegeName = req.query.collegeName;
            if (!validator.isValid(collegeName)) {
                res.status(400).send({ status: false, messege: "Please provide The College Name" });
                return
            }
            const lowerCollegeName = collegeName.toLowerCase();
            let college = await collegeModel.findOne({ name: lowerCollegeName, isDeleted: false });
            if (!college) {
                res.status(400).send({
                    status: false,
                    message: `The '${collegeName}' is not a valid college name. Please provide a valid college name to search interns details.`,
                });
                return;
            } else {
                let checkId = college._id;
                let name = college.name;
                let fullName = college.fullName;
                let logoLink = college.logoLink;

                let InternsApplied = await internModel
                    .find({ collegeId: checkId, isDeleted: false })
                    .select({ _id: 1, name: 1, email: 1, mobile: 1 });

                if (!InternsApplied.length > 0) {
                    let Data = {
                        name: name,
                        fullName: fullName,
                        logoLink: logoLink,
                        interests: `No interns applied for ${fullName}`
                    };
                    res.status(200).send({ status: true, data: Data });

                    return;
                } else {
                    let Data = {
                        name: name,
                        fullName: fullName,
                        logoLink: logoLink,
                        interests: InternsApplied,
                    };
                    res.status(200).send({
                        status: true,
                        message: `Successfully fetched all interns details of ${fullName}`,
                        data: Data,
                    });
                }
            }
        }
    } catch (error) {
        return res.status(500).send({
            status: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};
/////////////////////////////////////
//searching a document by blogId then updating their values & assigning them a new published date.
const updatedBlog = await blogModel.findOneAndUpdate({ _id: req.params.blogId }, {
    title: title,
    body: body,
    $push: { tags: tags, subcategory: subcategory },
    isPublished: isPublished
}, { new: true })