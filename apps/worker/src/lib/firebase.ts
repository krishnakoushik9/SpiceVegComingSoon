export interface FirestoreField {
  stringValue?: string;
  timestampValue?: string;
}

export interface FirestoreDocument {
  name?: string;
  fields: Record<string, FirestoreField>;
  createTime?: string;
  updateTime?: string;
}

export const formatToFirestore = (data: Record<string, any>) => {
  const fields: Record<string, FirestoreField> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      fields[key] = { stringValue: String(value) };
    }
  }
  return { fields };
};

export const parseFromFirestore = (doc: FirestoreDocument) => {
  const data: Record<string, string> = {};
  for (const [key, value] of Object.entries(doc.fields)) {
    data[key] = value.stringValue || '';
  }
  return data;
};

export class FirebaseClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(projectId: string, apiKey: string) {
    // Exact FS_BASE structure from legacy Spice55
    this.baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
    this.apiKey = apiKey;
  }

  async getDocument(collection: string, docId: string) {
    const url = `${this.baseUrl}/${collection}/${docId}?key=${this.apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json() as FirestoreDocument;
  }

  async setDocument(collection: string, docId: string, data: Record<string, any>) {
    const url = `${this.baseUrl}/${collection}/${docId}?key=${this.apiKey}`;
    const body = formatToFirestore(data);
    const res = await fetch(url, {
      method: 'PATCH', // PATCH handles create or update
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return res.ok;
  }

  async listDocuments(collection: string) {
    const url = `${this.baseUrl}/${collection}?key=${this.apiKey}`;
    const res = await fetch(url);
    const json = await res.json() as { documents?: FirestoreDocument[] };
    if (!json.documents) return [];
    return json.documents.map(doc => ({
      _id: doc.name?.split('/').pop(),
      ...parseFromFirestore(doc)
    }));
  }
}
