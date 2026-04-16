var ACTION_WORDS = [
  'fix','update','review','prepare','send','check','debug','create','build','test','write','deploy','analyze','design','implement',
  'handle','resolve','complete','submit','add','remove','refactor','document','setup','configure','integrate','merge','push','pull',
  'schedule','plan','follow up','coordinate','verify','validate','investigate','research','optimize','improve','migrate','backup','monitor',
  'present','share','upload','download','install','connect','call','email','message','notify','inform','ensure','take care','look into',
  'work on','finish','start','begin','make'
];

function generateId() { return 'task_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8); }
function normalizeText(text) { return String(text || '').replace(/[“”]/g, '"').replace(/[’]/g, "'").replace(/\s+/g, ' ').trim(); }

function isNoise(sentence) {
  var t = normalizeText(sentence).toLowerCase();
  if (!t || t.length < 4) return true;
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|ok|okay|alright|thanks|thank you|lets focus|let's focus|moving on|next point)$/.test(t)) return true;
  if (/^(alright guys|okay guys|guys let'?s|guys let's|so today|today we|let's start)$/i.test(t)) return true;
  return false;
}

function splitActions(text) {
  return normalizeText(text).split(/\b(?:and also|and then|and|also|then|,|;)\b/i).map(function (s) { return s.trim(); }).filter(Boolean);
}

function cleanTaskText(text) {
  var t = normalizeText(text);
  t = t.replace(/^(please|kindly|you should probably|you should|you need to|you have to|probably|maybe|just|actually|basically)\s+/i, '');
  t = t.replace(/\b(should|will|needs to|need to|must|can you|could you)\b/gi, '');
  t = t.replace(/\s+/g, ' ').trim();
  return t;
}

function classifyPriority(text) {
  var t = String(text || '').toLowerCase();
  if (/(fix|bug|error|crash|broken|urgent|asap|critical|security|login)/.test(t)) return 'high';
  if (/(review|check|verify|test|validate|update|look into)/.test(t)) return 'medium';
  return 'low';
}

function parseTranscript(transcript) {
  var sentences = String(transcript || '').split(/(?<=[.!?])\s+|\n+/).map(function (s) { return s.trim(); }).filter(Boolean);
  var tasks = [];
  for (var i = 0; i < sentences.length; i++) {
    var s = normalizeText(sentences[i]);
    if (isNoise(s)) continue;
    var names = s.match(/\b[A-Z][a-z]{2,20}\b/g) || [];
    var assignee = names.length ? names[0] : 'Unassigned';
    var actionFound = ACTION_WORDS.some(function (w) { return s.toLowerCase().indexOf(w) !== -1; });
    if (!actionFound) continue;
    var parts = splitActions(s);
    var matchedParts = [];
    for (var k = 0; k < parts.length; k++) {
      var part = parts[k];
      var partHasAction = ACTION_WORDS.some(function (w) { return part.toLowerCase().indexOf(w) !== -1; });
      if (partHasAction) matchedParts.push(part);
    }
    if (!matchedParts.length) matchedParts = [s];
    for (var m = 0; m < matchedParts.length; m++) {
      var txt = cleanTaskText(matchedParts[m]);
      if (!txt || txt.length < 3) continue;
      tasks.push({
        id: generateId(),
        text: txt,
        assignee: assignee,
        priority: classifyPriority(txt),
        done: /(done|completed|submitted|finished|resolved|closed)/i.test(txt),
        starred: false,
        createdAt: new Date().toISOString(),
        completedAt: ''
      });
    }
  }
  var seen = {};
  return tasks.filter(function (t) {
    var key = (t.assignee + '|' + t.text).toLowerCase();
    if (seen[key]) return false;
    seen[key] = true;
    return true;
  });
}

window.parseTranscript = parseTranscript;