// Keep the existing Pages CMS forms as the source of truth for PRISM.
import fs from 'node:fs';
import path from 'node:path';
import { stringify } from 'smol-toml';

export function syncContent(root = process.cwd()) {
  const content = path.join(root, 'content');
  const read = name => JSON.parse(fs.readFileSync(path.join(content, `${name}.json`), 'utf8'));
  const write = (name, data) => fs.writeFileSync(path.join(content, `${name}.toml`), stringify(data));
  const markdown = (name, text) => fs.writeFileSync(path.join(content, `${name}.md`), text);
  const text = value => String(value || '').replace(/[\\`*_{}\[\]<>]/g, '\\$&');
  const link = (label, url) => /^https?:\/\//i.test(url || '')
    ? `[${label}](<${url.replace(/[<>\s]/g, encodeURIComponent)}>)` : '';
  const p = read('profile');
  const sections = [['about', 'About'], ['news', 'News'], ['education', 'Education'],
    ['projects', 'Projects'], ['publications', 'Publications'], ['awards', 'Honors & Awards']];
  const photo = p.photo || '';
  if (photo && (!photo.startsWith('/media/') || photo.includes('..') || !fs.existsSync(path.join(root, photo)))) {
    throw new Error('The profile photo must be an existing file in /media/.');
  }
  write('config', {
    site: { title: p.name, description: `${p.name} — ${p.role} at ${p.institution}. Research interests: ${(p.interests || []).join(', ')}.`, favicon: '/favicon.svg', last_updated: new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Shanghai'}) },
    author: { name: [p.name, p.chinese_name].filter(Boolean).join(' · '), title: p.role, institution: p.institution, avatar: photo || '/avatar-placeholder.svg' },
    social: { email: p.email, github: p.github || '' },
    features: { enable_likes: false, enable_one_page_mode: true },
    i18n: { enabled: false, default_locale: 'en', locales: ['en'], mode: 'fixed', fixed_locale: 'en', switcher: false },
    navigation: sections.map(([target, title]) => ({title, type: 'page', target, href: target === 'about' ? '/' : `/${target}/`}))
  });
  write('about', {type: 'about', title: 'About', profile: {research_interests: p.interests || []}, sections: [{id: 'biography', type: 'markdown', source: 'bio.md', title: 'About'}]});
  markdown('bio', p.biography || '');
  write('news', {type: 'text', title: 'News', source: 'news.md'});
  markdown('news', read('news').items.map(n => `- **${text(n.date)}** — ${text(n.text)} ${link('More', n.url)}`).join('\n\n') || 'Updates will appear here.');
  const cards = (name, title, items) => write(name, {type: 'card', title, description: items.length ? '' : 'To be added.', items});
  cards('education', 'Education', read('education').items.map(e => ({title: e.institution, subtitle: e.degree, date: e.period, content: e.details || ''})));
  cards('projects', 'Projects', read('projects').items.map(e => ({title: e.title, date: e.period || '', content: [e.description, [link('Project', e.url), link('Code', e.code)].filter(Boolean).join(' · ')].filter(Boolean).join('\n\n')})));
  cards('publications', 'Publications', read('publications').items.map(e => ({title: e.title, subtitle: e.venue, content: [text(e.authors), [link('Paper', e.paper), link('Code', e.code), link('Project', e.project)].filter(Boolean).join(' · ')].filter(Boolean).join('\n\n')})));
  cards('awards', 'Honors & Awards', read('awards').items.map(e => ({title: e.title, date: e.year, subtitle: e.organization || ''})));
  fs.mkdirSync(path.join(root, 'public'), {recursive: true});
  fs.cpSync(path.join(root, 'media'), path.join(root, 'public/media'), {recursive: true});
  fs.writeFileSync(path.join(root, 'public/.nojekyll'), '');
}

if (process.argv[1] === new URL(import.meta.url).pathname) syncContent();
