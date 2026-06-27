import crypto from 'crypto';

export interface AuditRecord {
  id: string;
  timestamp: string;
  eventType: string;
  payload: any;
  previousHash: string;
  hash: string;
  signature: string; // Simulated Lattice/Ed25519 Post-Quantum Signature
}

export class MerkleAudit {
  private static instance: MerkleAudit;
  private chain: AuditRecord[] = [];
  
  // In a real PQC system, this would be a Dilithium/Kyber keypair.
  // We simulate it here using a high-entropy Ed25519 keypair for the demo.
  private privateKey: crypto.KeyObject;
  private publicKey: crypto.KeyObject;

  private constructor() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
    this.publicKey = publicKey;
    this.privateKey = privateKey;
    
    // Genesis Block
    this.appendRecord('SYSTEM_INIT', { message: 'Audit Engine Started' });
  }

  public static getInstance(): MerkleAudit {
    if (!MerkleAudit.instance) {
      MerkleAudit.instance = new MerkleAudit();
    }
    return MerkleAudit.instance;
  }

  public appendRecord(eventType: string, payload: any): AuditRecord {
    const previousHash = this.chain.length > 0 ? this.chain[this.chain.length - 1].hash : '0000000000000000000000000000000000000000000000000000000000000000';
    const timestamp = new Date().toISOString();
    const id = `audit_${crypto.randomUUID()}`;

    const dataToHash = JSON.stringify({ id, timestamp, eventType, payload, previousHash });
    
    // Hash (SHA-3 512 for quantum resistance in hash functions)
    const hash = crypto.createHash('sha3-512').update(dataToHash).digest('hex');

    // Simulate Lattice Signature
    const signature = crypto.sign(null, Buffer.from(hash), this.privateKey).toString('hex');

    const record: AuditRecord = {
      id,
      timestamp,
      eventType,
      payload,
      previousHash,
      hash,
      signature
    };

    this.chain.push(record);
    
    // Limit to 50 for memory safety
    if (this.chain.length > 50) {
      this.chain.shift();
    }
    
    return record;
  }

  public getChain(): AuditRecord[] {
    return [...this.chain].reverse();
  }
  
  public getPublicKeyPem(): string {
    return this.publicKey.export({ type: 'spki', format: 'pem' }).toString();
  }

  public verifyChain(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];
      
      if (current.previousHash !== previous.hash) {
        return false;
      }
      
      const dataToHash = JSON.stringify({
        id: current.id,
        timestamp: current.timestamp,
        eventType: current.eventType,
        payload: current.payload,
        previousHash: current.previousHash
      });
      
      const computedHash = crypto.createHash('sha3-512').update(dataToHash).digest('hex');
      if (computedHash !== current.hash) return false;
      
      const isValid = crypto.verify(null, Buffer.from(current.hash), this.publicKey, Buffer.from(current.signature, 'hex'));
      if (!isValid) return false;
    }
    return true;
  }
}
