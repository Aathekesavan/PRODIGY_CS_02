import hashlib
import numpy as np
from PIL import Image

def key_to_seed(key_str: str) -> int:
    """Converts a key string into a deterministic 32-bit integer seed."""
    sha256 = hashlib.sha256(key_str.encode('utf-8')).hexdigest()
    # Use the first 8 bytes of the hash to create a 32-bit unsigned integer seed
    return int(sha256[:8], 16)

def encrypt_xor(img_array: np.ndarray, key_str: str) -> np.ndarray:
    """Encrypts an image array by XORing RGB channels with a seeded random sequence."""
    seed = key_to_seed(key_str)
    rng = np.random.default_rng(seed)
    
    encrypted = img_array.copy()
    if img_array.ndim == 3 and img_array.shape[2] >= 3:
        # Encrypt only the first 3 channels (RGB) to preserve Alpha transparency if present
        h, w, c = img_array.shape
        noise_rgb = rng.integers(0, 256, size=(h, w, 3), dtype=np.uint8)
        encrypted[:, :, :3] = img_array[:, :, :3] ^ noise_rgb
    else:
        # Grayscale fallback
        noise = rng.integers(0, 256, size=img_array.shape, dtype=np.uint8)
        encrypted = img_array ^ noise
        
    return encrypted

def decrypt_xor(img_array: np.ndarray, key_str: str) -> np.ndarray:
    """XOR decryption is identical to XOR encryption."""
    return encrypt_xor(img_array, key_str)

def encrypt_shuffle(img_array: np.ndarray, key_str: str) -> np.ndarray:
    """Scrambles the spatial positions of pixels in the image using a seeded permutation."""
    shape = img_array.shape
    h, w = shape[0], shape[1]
    
    # Reshape image to list of pixels. Keep channel data grouped.
    # If dim is 2 (grayscale), reshape to (H*W, 1). If 3, (H*W, C).
    channels = shape[2] if img_array.ndim == 3 else 1
    flat = img_array.reshape(h * w, channels)
    
    seed = key_to_seed(key_str)
    rng = np.random.default_rng(seed)
    indices = rng.permutation(h * w)
    
    # Shuffle pixels
    shuffled_flat = flat[indices]
    
    # Reshape back to original dimensions
    if img_array.ndim == 3:
        return shuffled_flat.reshape(h, w, channels)
    else:
        return shuffled_flat.reshape(h, w)

def decrypt_shuffle(img_array: np.ndarray, key_str: str) -> np.ndarray:
    """Restores shuffled pixels back to their original coordinates using the inverse permutation."""
    shape = img_array.shape
    h, w = shape[0], shape[1]
    
    channels = shape[2] if img_array.ndim == 3 else 1
    flat = img_array.reshape(h * w, channels)
    
    seed = key_to_seed(key_str)
    rng = np.random.default_rng(seed)
    indices = rng.permutation(h * w)
    
    # Find inverse permutation
    inverse_indices = np.argsort(indices)
    
    # Unshuffle pixels
    unshuffled_flat = flat[inverse_indices]
    
    if img_array.ndim == 3:
        return unshuffled_flat.reshape(h, w, channels)
    else:
        return unshuffled_flat.reshape(h, w)

def encrypt_hybrid(img_array: np.ndarray, key_str: str) -> np.ndarray:
    """Performs spatial pixel shuffling followed by RGB XOR scrambling."""
    # Step 1: Shuffle pixels
    shuffled = encrypt_shuffle(img_array, key_str)
    
    # Step 2: XOR with a secondary derived key
    xor_key = key_str + "_hybrid_xor_salt"
    encrypted = encrypt_xor(shuffled, xor_key)
    
    return encrypted

def decrypt_hybrid(img_array: np.ndarray, key_str: str) -> np.ndarray:
    """Decrypts by reversing the RGB XOR scrambling first, then restoring pixel coordinates."""
    # Step 1: Reverse XOR
    xor_key = key_str + "_hybrid_xor_salt"
    dexor = decrypt_xor(img_array, xor_key)
    
    # Step 2: Unshuffle pixels
    decrypted = decrypt_shuffle(dexor, key_str)
    
    return decrypted


if __name__ == "__main__":
    # Self-test script to verify cryptographic correctness
    print("Running encryption engine self-test...")
    
    # Create dummy 100x100 RGB image
    test_img = np.random.randint(0, 256, (100, 100, 3), dtype=np.uint8)
    key = "TestSecureKey123!"
    
    # 1. Test XOR
    encrypted_xor = encrypt_xor(test_img, key)
    decrypted_xor = decrypt_xor(encrypted_xor, key)
    assert np.array_equal(test_img, decrypted_xor), "XOR Cryptography test failed!"
    print("[SUCCESS] XOR Encryption/Decryption verified (100% pixel match)")
    
    # 2. Test Shuffle
    encrypted_shuf = encrypt_shuffle(test_img, key)
    decrypted_shuf = decrypt_shuffle(encrypted_shuf, key)
    assert np.array_equal(test_img, decrypted_shuf), "Shuffle Cryptography test failed!"
    print("[SUCCESS] Shuffle Encryption/Decryption verified (100% pixel match)")
    
    # 3. Test Hybrid
    encrypted_hyb = encrypt_hybrid(test_img, key)
    decrypted_hyb = decrypt_hybrid(encrypted_hyb, key)
    assert np.array_equal(test_img, decrypted_hyb), "Hybrid Cryptography test failed!"
    print("[SUCCESS] Hybrid Encryption/Decryption verified (100% pixel match)")
    
    print("All engine self-tests passed successfully.")
