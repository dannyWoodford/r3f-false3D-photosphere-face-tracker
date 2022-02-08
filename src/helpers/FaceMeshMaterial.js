import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import faceMeshTemplate from '../assets/faceMeshTemplate.png';

const FaceMeshMaterial = () => {
    const faceMapTexture = useLoader(TextureLoader, faceMeshTemplate);
    return <meshStandardMaterial transparent map={faceMapTexture} />;
}

export default FaceMeshMaterial