export const projectsContent = `
            <div class="projects-grid">
                <div class="project-card project-highlight">
                    <div class="project-header">
                        <div class="project-title">
                            <h3>AI-Powered Internship Aggregator Pipeline</h3>
                            <div class="project-sub">Automated scraping, classification & deduplication for internship listings</div>
                        </div>
                        <div class="project-actions">
                            <button class="project-btn" disabled aria-disabled="true">View details (coming soon)</button>
                            <button class="project-btn ghost" disabled aria-disabled="true">Source (private)</button>
                        </div>
                    </div>

                    <div class="project-body">
                        <p class="project-lead">Built a reliable pipeline to collect, clean and classify internship postings from Internshala. Focused on data quality, lightweight ML classification and an extensible ingestion flow so new sources can be added with minimal effort.</p>

                        <div class="project-screenshot" aria-hidden="true">Screenshot</div>

                        <div class="project-tech">
                            <span class="tech-tag">Python</span>
                            <span class="tech-tag">Playwright</span>
                            <span class="tech-tag">TF‑IDF</span>
                            <span class="tech-tag">Logistic Regression</span>
                            <span class="tech-tag">MongoDB</span>
                            <span class="tech-tag">Docker</span>
                        </div>

                        <ul class="project-points">
                            <li>Playwright-based crawlers scrape and normalize postings; supports incremental updates and deduplication.</li>
                            <li>Feature pipeline with TF‑IDF and Logistic Regression classifies roles into 5 CS domains with high precision.</li>
                            <li>Designed modular ingestion with MongoDB upserts, dedupe keys and idempotent processing for reliability.</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;