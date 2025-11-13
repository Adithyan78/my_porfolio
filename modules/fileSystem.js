import { skillsContent } from './skills.js';
import { projectsContent } from './projects.js';
import { resumeContent } from './resume.js';
import { contactContent } from './contact.js';
import { aboutContent } from './about.js';
import { musicContent } from './music.js';

export const fileSystem = {
    "Tech Skills": {
        type: "folder",
        icon: "assets/icons/skills.svg",
        content: skillsContent
    },
    "Projects": {
        type: "folder",
        icon: "assets/icons/project.svg",
        content: projectsContent
    },
    "Resume": {
        type: "file",
        icon: "assets/icons/resume.svg",
        content: resumeContent
    },
    "Contact": {
        type: "folder",
        icon: "assets/icons/contact.svg",
        content: contactContent
    },
    "About Me": {
        type: "file",
        icon: "assets/icons/about.svg",
        content: aboutContent
    },
    "File Explorer": {
        type: "folder",
        icon: "assets/icons/file-explorer.svg",
        content: `
            <div class="file-explorer">
                <div class="sidebar">
                    <div class="sidebar-item active">
                        <i class="fas fa-desktop"></i>
                        <span>Desktop</span>
                    </div>
                    <div class="sidebar-item">
                        <i class="fas fa-download"></i>
                        <span>Downloads</span>
                    </div>
                    <div class="sidebar-item">
                        <i class="fas fa-folder"></i>
                        <span>Documents</span>
                    </div>
                    <div class="sidebar-item">
                        <i class="fas fa-cog"></i>
                        <span>System</span>
                    </div>
                </div>
                <div class="content-area">
                    <div class="folder-view">
                        <div class="folder-item" data-window="skills" data-title="Tech Skills">
                            <img src="assets/icons/skills.svg" class="custom-icon" alt="Tech Skills">
                            <span>Tech Skills</span>
                        </div>
                        <div class="folder-item" data-window="projects" data-title="Projects">
                            <img src="assets/icons/project.svg" class="custom-icon" alt="Projects">
                            <span>Projects</span>
                        </div>
                        <div class="folder-item" data-window="resume" data-title="Resume">
                            <img src="assets/icons/resume.svg" class="custom-icon" alt="Resume">
                            <span>Resume</span>
                        </div>
                        <div class="folder-item" data-window="contact" data-title="Contact">
                            <img src="assets/icons/contact.svg" class="custom-icon" alt="Contact">
                            <span>Contact</span>
                        </div>
                        <div class="folder-item" data-window="about" data-title="About Me">
                            <img src="assets/icons/about.svg" class="custom-icon" alt="About Me">
                            <span>About Me</span>
                        </div>
                    </div>
                </div>
            </div>
        `
    }
        ,
        "Music": {
            type: "file",
            icon: "assets/icons/spotify.svg",
            content: musicContent
        }
};
