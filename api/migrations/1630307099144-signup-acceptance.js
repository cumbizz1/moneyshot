const { DB, COLLECTION } = require('./lib');

const SETTING_KEYS = {
  ACCEPTANCE_SIGNUP_ID: 'acceptanceSignupId'
};

module.exports.up = async function up(next) {
  const pages = [
    {
      title: 'By signing up you agree to our <a>Acceptance Signup</a>, and confirm that you are at least 18 years old',
      type: 'post',
      status: 'published',
      authorId: null,
      shortDescription: 'Acceptance content once user sign up',
      content: '<p>By signing up you agree to our <a>Terms of Service</a> and <a>Privacy & Policy</a>, and confirm that you are at least 18 years old.</p>',
      slug: 'acceptance-signup'
    }
  ];

  await pages.reduce(async (previousPromise, page) => {
    await previousPromise;

    let post = await DB.collection(COLLECTION.POST).findOne({ slug: page.slug });
    if (!post) {
      post = await DB.collection(COLLECTION.POST).insertOne({
        ...page,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    return Promise.resolve();
  }, Promise.resolve());

  // insert settings
  const acceptanceSignup = await DB.collection(COLLECTION.SETTING).findOne({ key: SETTING_KEYS.ACCEPTANCE_SIGNUP_ID });
  if (!acceptanceSignup) {
    await DB.collection(COLLECTION.SETTING).insertOne({
      key: SETTING_KEYS.ACCEPTANCE_SIGNUP_ID,
      value: 'acceptance-signup',
      name: 'Acceptance Signup',
      description:
        'Select the post with content that will be shown in user sign up page',
      type: 'post',
      group: 'pageContent',
      public: true,
      editable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  next();
};

module.exports.down = function down(next) {
  next();
};
