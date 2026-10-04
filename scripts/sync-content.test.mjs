import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parse } from 'smol-toml';
import { syncContent } from './sync-content.mjs';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'prism-content-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  fs.mkdirSync(path.join(root, 'content'));
  fs.mkdirSync(path.join(root, 'media'));
  const save = (name, value) => fs.writeFileSync(path.join(root, 'content', `${name}.json`), JSON.stringify(value));
  const read = name => parse(fs.readFileSync(path.join(root, 'content', `${name}.toml`), 'utf8'));
  const profile = {name: 'Test Author', role: 'Student', institution: 'Example University', email: 'test@example.com', biography: 'A biography.', interests: ['Pose']};
  save('profile', profile);
  for (const name of ['news', 'education', 'projects', 'publications', 'awards']) save(name, {items: []});
  return {root, save, read, profile};
}

test('empty CMS content preserves content and exposes only the three requested pages', t => {
  const f = fixture(t);
  syncContent(f.root);
  assert.deepEqual(f.read('config').navigation.map(n => [n.title, n.href]), [
    ['Homepage', '/'], ['Publications', '/publications/'], ['Awards', '/awards/'],
  ]);
  assert.equal(f.read('config').features.enable_one_page_mode, false);
  assert.equal(f.read('config').author.name, 'Test Author');
  assert.equal(f.read('config').author.avatar, '/avatar-placeholder.svg');
  for (const name of ['education', 'projects', 'publications', 'awards']) {
    assert.equal(f.read(name).items.length, 0);
    assert.equal(f.read(name).description, 'To be added.');
  }
});

test('CMS edits and uploaded photo propagate, preserving publication links', t => {
  const f = fixture(t);
  fs.writeFileSync(path.join(f.root, 'media', 'portrait.png'), 'fixture');
  f.save('profile', {...f.profile, photo: '/media/portrait.png', chinese_name: '测试'});
  f.save('publications', {items: [{title: 'A "quoted" paper', authors: 'A and B', venue: 'Example 2027', paper: 'https://example.com/paper', code: 'https://example.com/code', project: 'https://example.com/project'}]});
  f.save('news', {items: [{date: '2027', text: 'An update', url: 'javascript:alert(1)'}]});
  f.save('education', {items: [{institution: 'University', degree: 'PhD', period: 'Starting 2027', details: 'Incoming'}]});
  f.save('projects', {items: [{title: 'Pose project', period: '2027', description: 'Research notes', url: 'https://example.com/project', code: 'https://example.com/code'}]});
  f.save('awards', {items: [{title: 'Example award', year: '2027', organization: 'Example organization'}]});
  syncContent(f.root);
  assert.match(f.read('projects').items[0].content, /Research notes/);
  assert.equal(f.read('awards').items[0].subtitle, 'Example organization');
  assert.equal(f.read('config').author.avatar, '/media/portrait.png');
  assert.equal(f.read('publications').items[0].title, 'A "quoted" paper');
  assert.match(f.read('publications').items[0].content, /https:\/\/example.com\/project/);
  assert.equal(f.read('education').items[0].date, 'Starting 2027');
  assert.ok(fs.existsSync(path.join(f.root, 'public/media/portrait.png')));
  assert.doesNotMatch(fs.readFileSync(path.join(f.root, 'content/news.md'), 'utf8'), /javascript:/);
});

test('invalid photo path fails before publication', t => {
  const f = fixture(t);
  f.save('profile', {...f.profile, photo: '/media/../../secret.png'});
  assert.throws(() => syncContent(f.root), /profile photo/);
});
