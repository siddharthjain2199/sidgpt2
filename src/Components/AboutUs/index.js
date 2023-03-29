import React from 'react';

function AboutUs() {
  return (
    <section className='container mx-auto p-5 fixed inset-0 mt-4'>
      <div className="mockup-window bg-base-300 w-full h-full flex flex-col">
        <div className="p-5 pb-8 flex-grow overflow-auto text-light">
          <h2 className='text-center mb-3'>About ShopKart</h2>
          <p>Welcome to SidGPT AI, a powerful language processing tool designed to assist you in various tasks such as writing, content creation, and information retrieval. Our AI tool is built on the GPT-3.5 architecture and is trained on a vast corpus of language data to provide you with accurate and relevant results.
          </p>
          <p>
            At SidGPT AI, we are committed to providing you with the highest quality language processing services. Our tool is designed to be user-friendly and accessible to anyone, regardless of their technical expertise. We believe that everyone should have access to cutting-edge language processing technology, and we strive to make this a reality with our AI tool.
          </p>
          <p>
            Our team is made up of experts in natural language processing, machine learning, and software development. We are passionate about using technology to enhance human communication and help people accomplish their goals. If you have any questions or feedback about our AI tool, please don't hesitate to contact us. We are always happy to hear from our users and are committed to continuously improving our services to meet your needs.
          </p>
        </div>
      </div>
    </section>
  );
}

export default AboutUs;
