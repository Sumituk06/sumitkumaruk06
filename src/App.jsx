import { useEffect, useState } from 'react';
import ScrollProgress from './components/ScrollProgress';
import CoderBackground from './components/CoderBackground';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import SkillsSection from './components/SkillsSection';
import ProjectsSection from './components/ProjectsSection';
import EducationSection from './components/EducationSection';
import AiAssistant from './components/AiAssistant';
import ContactSection from './components/ContactSection';
import ResumeModal from './components/ResumeModal';
import Footer from './components/Footer';
import { useTheme } from './hooks/useTheme';

const SECTION_IDS = ['home', 'about', 'skills', 'projects', 'education', 'aibot', 'contact'];

export default function App() {
  const { resolvedScheme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('home');
  const [showTopButton, setShowTopButton] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowTopButton(window.scrollY > 360);

      let current = 'home';
      const offset = window.scrollY + 150;
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= offset) {
          current = id;
        }
      }
      setActiveSection(current);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <ScrollProgress />

      <CoderBackground resolvedScheme={resolvedScheme} />

      <Navbar
        activeSection={activeSection}
        resolvedScheme={resolvedScheme}
        onToggleTheme={toggleTheme}
        onOpenResume={() => setResumeOpen(true)}
      />

      <main id="main-content" className="main-container">
        <Hero onOpenResume={() => setResumeOpen(true)} />
        <AboutSection />
        <SkillsSection />
        <ProjectsSection />
        <EducationSection />
        <AiAssistant />
        <ContactSection />
      </main>

      <Footer showTopButton={showTopButton} />

      <ResumeModal isOpen={resumeOpen} onClose={() => setResumeOpen(false)} />
    </>
  );
}

