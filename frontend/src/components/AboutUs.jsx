import React from 'react';

const AboutUs = () => {
  const team = [
    {
      name: 'Manuj Chaudhari',
      role: 'Project Manager & Full-Stack Developer',
      description: 'Leading the development and coordination of ASKit for TenAI Hackathon.',
      image: '/api/placeholder/300/300'
    },
    {
      name: 'Govinda Tiwari',
      role: 'UI/UX Developer',
      description: 'Crafting beautiful and intuitive user interfaces with React and Tailwind.',
      image: '/api/placeholder/300/300'
    },
    {
      name: 'Tejas Ramteke',
      role: 'API & Database Developer',
      description: 'Building robust backend systems and AI integration for seamless functionality.',
      image: '/api/placeholder/300/300'
    },
    {
      name: 'Tejas Ramteke',
      role: 'Machine Learning Developer',
      description: 'Implementing AI-powered features and intelligent chat capabilities.',
      image: '/api/placeholder/300/300'
    }
  ];

  const values = [
    {
      title: 'Innovation in 48 Hours',
      description: 'We pushed the boundaries of what\'s possible in a hackathon timeframe, delivering a full-featured AI platform.',
      icon: '⚡'
    },
    {
      title: 'Collaborative Spirit',
      description: 'Our diverse team brought together different skills and perspectives to create something greater than the sum of its parts.',
      icon: '🤝'
    },
    {
      title: 'Real-World Impact',
      description: 'We focused on solving actual business problems with practical, implementable solutions.',
      icon: '🎯'
    },
    {
      title: 'Learning & Growth',
      description: 'This hackathon challenged us to learn new technologies and push our development skills to the next level.',
      icon: '📚'
    }
  ];

  const stats = [
    { number: '48hrs', label: 'Development Time' },
    { number: '5+', label: 'Core Features' },
    { number: '100%', label: 'Passion Driven' },
    { number: '1st', label: 'Hackathon Project' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-black mb-6">
              Built by Team Hopper Hackers
              <span className="block">for TenAI Hackathon</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              ASKit is our innovative submission for TenAI's Programmer's Day Hackathon, 
              showcasing the power of AI-driven customer interaction and business analytics.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-300 text-sm uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-6">Our Hackathon Journey</h2>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              Team Hopper Hackers came together for TenAI's Programmer's Day Hackathon with a 
              shared vision: to create an intelligent business assistant that could revolutionize 
              customer interactions and financial analytics.
            </p>
            
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              In just 48 hours, our diverse team of passionate developers, designers, and AI 
              enthusiasts built ASKit from the ground up. We combined cutting-edge AI technologies 
              with modern web development practices to create a comprehensive platform that 
              addresses real business challenges.
            </p>
            
            <p className="text-gray-700 text-lg leading-relaxed">
              ASKit represents our commitment to innovation and our belief that powerful AI tools 
              should be accessible to businesses of all sizes. This hackathon project showcases 
              what's possible when creativity meets technology in a collaborative environment.
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-6">Our Hackathon Values</h2>
            <p className="text-gray-600 text-lg">
              The principles that guided our development process
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-black mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-6">Meet Team Hopper Hackers</h2>
            <p className="text-gray-600 text-lg">
              The passionate developers behind ASKit
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-48 h-48 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-4xl">👤</span>
                </div>
                <h3 className="text-lg font-bold text-black mb-1">{member.name}</h3>
                <p className="text-gray-600 text-sm font-medium mb-3">{member.role}</p>
                <p className="text-gray-500 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-black py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Our Hackathon Mission</h2>
          <p className="text-gray-300 text-xl leading-relaxed">
            To demonstrate the power of collaborative innovation by building a comprehensive AI-powered 
            business platform in just 48 hours. ASKit showcases how modern web technologies, artificial 
            intelligence, and creative problem-solving can come together to create meaningful solutions 
            for real-world business challenges.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-black mb-4">
            Experience Our Hackathon Creation
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Built with passion during TenAI's Programmer's Day Hackathon by Team Hopper Hackers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-black text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
              Try ASKit Now
            </button>
            <button className="border-2 border-black text-black px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              View Source Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;