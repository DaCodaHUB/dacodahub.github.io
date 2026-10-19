import { test } from 'node:test';
import assert from 'node:assert/strict';
import { topics, categories } from '../../src/data/android-fundamentals/topics.ts';
import { resourceTypes } from '../../src/data/android-fundamentals/types.ts';
import { countResources, filterTopics, indexTopic, normalizeSearch } from '../../src/lib/android-library.ts';
import { videoAdditions } from '../../src/data/android-fundamentals/videos.ts';

const index = topics.map(indexTopic);
const all = { query: '', category: 'all', difficulty: 'all' };

test('library identifiers, category membership and topic content meet the directory contract', () => {
  const ids = new Set<string>(), categoryIds = new Set(categories.map(category => category.id));
  assert.equal(categoryIds.size, categories.length);
  for (const topic of topics) {
    assert.match(topic.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(!ids.has(topic.id), `Duplicate topic: ${topic.id}`); ids.add(topic.id);
    assert.ok(categoryIds.has(topic.category as typeof categories[number]['id']));
    assert.ok(['Beginner', 'Intermediate', 'Advanced'].includes(topic.difficulty));
    assert.ok(topic.title.trim().length > 0);
    assert.ok(topic.description.trim().length >= 30);
    assert.ok(topic.concepts.length >= 3);
    assert.ok(topic.resources.length >= 1);
  }
  for (const category of categories) assert.ok(topics.some(topic => topic.category === category.id), `Empty category: ${category.id}`);
});

test('resources have useful titles, approved types, HTTPS URLs and no credential-bearing links', () => {
  const usedTypes = new Set<string>();
  for (const topic of topics) {
    const urls = new Set<string>();
    for (const resource of topic.resources) {
      assert.ok(resource.title.trim().length >= 4);
      assert.ok(resourceTypes.includes(resource.type)); usedTypes.add(resource.type);
      const url = new URL(resource.url);
      assert.equal(url.protocol, 'https:');
      assert.equal(url.username, ''); assert.equal(url.password, '');
      assert.ok(![...url.searchParams.keys()].some(key => /api.?key|token|password|secret/i.test(key)));
      assert.ok(!urls.has(resource.url), `Duplicate resource in ${topic.id}`); urls.add(resource.url);
      if (resource.type === 'video') {
        assert.ok(resource.creator?.trim(), 'Videos must identify the verified creator');
        assert.ok(resource.description?.trim(), 'Videos must explain their relevance');
        assert.equal(url.hostname, 'www.youtube.com'); assert.equal(url.pathname, '/watch');
        assert.match(url.searchParams.get('v') ?? '', /^[A-Za-z0-9_-]{11}$/);
      }
      if (resource.type === 'repository') assert.equal(url.hostname, 'github.com');
    }
  }
  assert.deepEqual([...usedTypes].sort(), [...resourceTypes].sort());
});

test('video additions refer to existing topics, are unique, and preserve written resources', () => {
  const ids = new Set(topics.map(topic => topic.id));
  const urls = new Set<string>();
  for (const addition of videoAdditions) {
    assert.ok(addition.topicIds.length > 0);
    for (const id of addition.topicIds) assert.ok(ids.has(id), `Unmatched video topic: ${id}`);
    assert.ok(!urls.has(addition.resource.url), 'A video should be curated once with explicit related topic IDs');
    urls.add(addition.resource.url);
  }
  const written = new Set(topics.flatMap(topic => topic.resources.filter(resource => resource.type !== 'video').map(resource => resource.url)));
  assert.equal(written.size, 151, 'Preserve the existing documentation, repositories and articles');
});

test('the requested starting repositories and verified mock interview remain represented', () => {
  const urls = new Set(topics.flatMap(topic => topic.resources.map(resource => resource.url)));
  for (const url of ['https://github.com/android/nowinandroid', 'https://github.com/amitshekhariitbhu/android-interview-questions', 'https://github.com/weeeBox/mobile-system-design', 'https://www.youtube.com/watch?v=qLdy-65LsGk']) assert.ok(urls.has(url));
});

test('search handles case, whitespace, punctuation and multiple terms', () => {
  assert.ok(filterTopics(index, { ...all, query: '  STATEFLOW / sharedFlow  ' }).some(topic => topic.id === 'concurrency-stateflow-sharedflow'));
  assert.equal(normalizeSearch('  Café: Kotlin—Java! '), 'cafe kotlin java');
  assert.equal(filterTopics(index, { ...all, query: '   ' }).length, topics.length);
});

test('search includes descriptions and key concepts, not only titles', () => {
  assert.ok(filterTopics(index, { ...all, query: 'tying up a thread' }).some(topic => topic.id === 'concurrency-coroutines'));
  assert.ok(filterTopics(index, { ...all, query: 'replay conflation' }).some(topic => topic.id === 'concurrency-stateflow-sharedflow'));
  assert.ok(filterTopics(index, { ...all, query: 'Big O' }).some(topic => topic.id === 'interviews-algorithms'));
});

test('category, difficulty and search combine as an intersection', () => {
  const result = filterTopics(index, { query: 'cancellation', category: 'concurrency', difficulty: 'Advanced' });
  assert.ok(result.length > 0);
  assert.ok(result.every(topic => topic.category === 'concurrency' && topic.difficulty === 'Advanced'));
  assert.equal(filterTopics(index, { ...all, query: 'StateFlow', category: 'security' }).length, 0);
});

test('empty results, invalid filters and reset behavior are deterministic without mutating the index', () => {
  const before = structuredClone(index);
  assert.equal(filterTopics(index, { ...all, query: 'not-a-real-android-concept-987654' }).length, 0);
  assert.equal(filterTopics(index, { ...all, category: 'not-a-category' }).length, 0);
  assert.equal(filterTopics(index, { ...all, difficulty: 'not-a-level' }).length, 0);
  assert.equal(filterTopics(index, all).length, topics.length);
  assert.deepEqual(index, before);
});

for (const type of resourceTypes) test('resource filter intersects search and category: ' + type, () => {
  const selected = filterTopics(index, { ...all, resourceType: type });
  assert.deepEqual(selected.map(t => t.id), topics.filter(t => t.resources.some(r => r.type === type)).map(t => t.id));
  for (const category of categories) {
    const result = filterTopics(index, { ...all, category: category.id, resourceType: type });
    assert.ok(result.every(t => t.category === category.id && t.resources.some(r => r.type === type)));
  }
  const searched = filterTopics(index, { ...all, query: 'state', resourceType: type });
  assert.deepEqual(searched, selected.filter(t => t.text.includes('state')));
  const expected = new Set(selected.flatMap(t => t.resources.filter(r => r.type === type).map(r => r.url)));
  assert.equal(countResources(selected, type), expected.size);
});
test('resource filters handle empty results, unsupported types and resetting all filters', () => {
  assert.equal(filterTopics(index, { ...all, resourceType: 'invalid' }).length, 0);
  assert.equal(filterTopics(index, { ...all, resourceType: 'video', query: 'no-match-987654' }).length, 0);
  assert.equal(countResources([],'video'), 0);
  assert.deepEqual(filterTopics(index, { ...all, resourceType: 'all' }), index);
  assert.equal(countResources(index), new Set(topics.flatMap(t => t.resources.map(r => r.url))).size);
  const missing = index.find(t => !t.resources.some(r => r.type === 'repository'))!;
  assert.ok(!filterTopics([missing], { ...all, resourceType: 'repository' }).length);
});
