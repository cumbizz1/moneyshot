const { DB, COLLECTION } = require('./lib');

const SETTING_KEYS = {
  WELCOME_PAGE_ID: 'welcomePageId',
  HOME_CONTENT_PAGE_ID: 'homeContentPageId',
  CONTACT_PAGE_ID: 'contactPageId'
};

module.exports.up = async function up(next) {
  const pages = [
    {
      title: `Welcome to ${process.env.DOMAIN}`,
      type: 'post',
      status: 'published',
      authorId: null,
      shortDescription: 'Welcome',
      content: `<p>${process.env.DOMAIN} lets you create profitable adult membership websites. </p>

        <p>Create highly-profitable, scalable, and customizable adult membership sites like Brazzers, NaughtyAmerica, and RealityKings with ${process.env.DOMAIN}! ${process.env.DOMAIN} is a versatile and cutting-edge adult CMS that includes advanced membership management, video streaming, payment gateways, and more. </p>
        
        <p>This simple to install script and CMS is perfect for content producers, production studios, and solo performers. Within minutes of installing your script, you can have the foundations to a highly trafficked, profitable adult membership site. This script can be used by anyone to start a membership site. Turn it on and it’s good to go. Load up the content and get to selling! </p>
        
        <p>Permission to enter the Website and to view and download its contents is strictly limited only to consenting adults who affirm that the following statements are true:</p>
        
        <p>I am at least 18-years old or the age of legal majority where I live (whichever is greater), and that I am voluntarily choosing to view and access the sexually-explicit images and content for my own personal use and entertainment; </p>
        
        <p>I will not expose any minors or third parties to sexually explicit content I am about to view; </p>
        
        <p>I understand that the content on the Website is sexually explicit in nature and depicts adults engaged in consensual sex; </p>
        
        <p>It is my constitutional right to receive, view, and download the content; </p>
        
        <p>I believe that sexual acts between consenting adults are neither offensive nor obscene and I desire to view or download the content;
        The viewing, reading, and downloading of sexually explicit materials does not violate the standards of any community, town, city, state, or country where I will view, read, or download the content; </p>
        
        <p>I will not sell, distribute, give, or make available the content on this Website to anyone and I will take the appropriate steps in order to make sure no minor is able to view the content available on this Website; </p>
        
        <p>I am solely responsible for any false disclosures or legal ramifications of viewing, reading or downloading any of the content on the Website. Further, neither the Website nor its affiliates, agents, and operators will be held responsible for any legal ramifications arising from any fraudulent entry into or use of the Website; </p>
        
        <p>I understand that the content on the Website is meant to serve as a visual record of the methods of interpersonal and sexual relationships, but that these fictional accounts do not always exhibit safe sex, or the full range of real life emotions and relationships; </p>
        
        <p>I understand and agree that my use of the Website is governed by the Website's Terms of Use, and the Website's Privacy Policy, which I have carefully reviewed and accepted, and I agree I am legally bound by the Terms of Use and Privacy Policy; </p>
        
        <p>I agree that by entering the Website, I am subjecting myself to the personal jurisdiction of the Turks and Caicos Islands, should any dispute arise at any time between the Website and myself according to the Website's Terms of Use; </p>
        
        <p>I agree that by entering the Site, I am subjecting myself to binding arbitration, should any dispute arise at any time between the Website and myself according to the Website's Terms of Use;</p>
        
        <p>I agree that this warning page forms an agreement between me and the Website and by choosing to click on "Agree & Enter", and indicating my agreement to be bound by the terms of this agreement, the Terms of Use, and the Privacy Policy, I consent to be bound by the terms of this warning page, the Terms of Use, and the Privacy Policy.</p>`,
      slug: 'welcome-home'
    },
    {
      title: 'Home',
      type: 'post',
      status: 'published',
      authorId: null,
      shortDescription: 'Privacy and Policy',
      content: `${process.env.DOMAIN} redefines what hailing a cab in the UK can lead to in vivid detail. Our pretend taxi drivers love to get the hottest British girls into the backseats of their cars and take them for a bumpy ride. Who can blame them? We all know that luscious vixens from Great Britain make the best passengers; especially when they are clueless as to what is going on and in for a big X-rated surprise. Witness a dazzling array of busty English babes getting creative once they realize what they’re in for in these fake cabs. They don’t care where they’re going as long as they can get naked and have torrid car sex with their horny drivers. Vigorous handjobs lead to gagging deepthroat blowjobs with an abundance of cum swallowing. The buxom bombshells featured in our hardcore HD porn videos never just stop there. They pounce on huge cocks and stuff them deep within every starving orifice repeatedly. Big-titted female customers don’t need to have a penny on them if they want to go for a spin at Fake Taxi. Their delicious assets are much more welcome as`,
      slug: 'home-content'
    },
    {
      title: 'Contact',
      type: 'post',
      status: 'published',
      authorId: null,
      shortDescription: 'USC2257',
      content: `Contact us with below: <br />
        Email: admin@${process.env.DOMAIN}`,
      slug: 'contact'
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
  const welcomePage = await DB.collection(COLLECTION.SETTING).findOne({ key: SETTING_KEYS.WELCOME_PAGE_ID });
  if (!welcomePage) {
    await DB.collection(COLLECTION.SETTING).insertOne({
      key: SETTING_KEYS.WELCOME_PAGE_ID,
      value: 'welcome-home',
      name: 'Welcome content',
      description:
        'Select the post with content that will be shown in the welcome page',
      type: 'post',
      group: 'pageContent',
      public: true,
      editable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // insert settings
  const homeContent = await DB.collection(COLLECTION.SETTING).findOne({ key: SETTING_KEYS.HOME_CONTENT_PAGE_ID });
  if (!homeContent) {
    await DB.collection(COLLECTION.SETTING).insertOne({
      key: SETTING_KEYS.HOME_CONTENT_PAGE_ID,
      value: 'home-content',
      name: 'Home content',
      description:
        'Select the post with content that will be shown in the home page',
      type: 'post',
      group: 'pageContent',
      public: true,
      editable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  const contactContent = await DB.collection(COLLECTION.SETTING).findOne({
    key: SETTING_KEYS.CONTACT_PAGE_ID
  });
  if (!contactContent) {
    await DB.collection(COLLECTION.SETTING).insertOne({
      key: SETTING_KEYS.CONTACT_PAGE_ID,
      value: 'contact',
      name: 'Contact content',
      description:
        'Select the post with content that will be shown in the contact page',
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
