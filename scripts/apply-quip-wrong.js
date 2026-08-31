const fs = require('fs');
const path = require('path');

const updates = require('../data/_quip_updates.json');

const map = new Map();
for (const u of updates) {
  let val = u.quip_wrong;
  const trimmed = val.trim();
  if (trimmed.startsWith('{')) {
    try {
      val = JSON.parse(trimmed);
    } catch (e) {
      console.error('Failed to parse JSON quip_wrong for', u.id, e.message);
    }
  }
  map.set(u.id, val);
}

const dir = path.join(__dirname, '..', 'data', 'questions');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

let totalChanged = 0;
const unmatchedIds = new Set(map.keys());

for (const file of files) {
  const fp = path.join(dir, file);
  const raw = fs.readFileSync(fp, 'utf8');
  const qs = JSON.parse(raw);
  let changed = 0;
  for (const q of qs) {
    if (map.has(q.id)) {
      q.quip_wrong = map.get(q.id);
      changed++;
      unmatchedIds.delete(q.id);
    }
  }
  if (changed > 0) {
    fs.writeFileSync(fp, JSON.stringify(qs, null, 1) + '\n', 'utf8');
    console.log(file, 'changed:', changed);
    totalChanged += changed;
  }
}

console.log('TOTAL CHANGED:', totalChanged);
console.log('UNMATCHED (not found in any file):', unmatchedIds.size);
if (unmatchedIds.size > 0) {
  console.log([...unmatchedIds].join(', '));
}
