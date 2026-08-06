export const DEFAULT_CAMERA_YAW = Math.PI / 2;

export function computeDesiredMove(cameraYaw, input) {
  const forward = {
    x: Math.sin(cameraYaw),
    z: Math.cos(cameraYaw),
  };
  const right = {
    x: -forward.z,
    z: forward.x,
  };
  const desired = {
    x: forward.x * input.z + right.x * input.x,
    z: forward.z * input.z + right.z * input.x,
  };
  const length = Math.hypot(desired.x, desired.z);

  if (length < 0.001) {
    return { x: 0, z: 0 };
  }

  return {
    x: desired.x / length,
    z: desired.z / length,
  };
}
