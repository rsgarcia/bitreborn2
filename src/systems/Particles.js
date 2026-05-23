export class ParticleBurst {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
  }

  emit(x, y, color, amount = 12) {
    for (let i = 0; i < amount; i += 1) {
      const particle = this.scene.add
        .circle(
          x + Phaser.Math.FloatBetween(-10, 10),
          y + Phaser.Math.FloatBetween(-10, 10),
          Phaser.Math.Between(2, 5),
          color,
          1
        )
        .setDepth(60);

      particle.velocity = new Phaser.Math.Vector2(
        Phaser.Math.FloatBetween(-2, 2),
        Phaser.Math.FloatBetween(-4, -0.5)
      );
      particle.life = Phaser.Math.Between(20, 50);
      this.particles.push(particle);
    }
  }

  update() {
    this.particles = this.particles.filter((particle) => {
      particle.x += particle.velocity.x;
      particle.y += particle.velocity.y;
      particle.velocity.y += 0.1;
      particle.life -= 1;
      particle.setAlpha(Math.max(0, particle.life / 50));

      if (particle.life <= 0) {
        particle.destroy();
        return false;
      }

      return true;
    });
  }
}
