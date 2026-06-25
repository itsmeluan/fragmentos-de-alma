// AUTO-GERADO — não editar à mão. Regenerar com o script de geração de registry.
// Sprites de herói PixelLab. require() exige string literal, por isso o mapa é estático.
//
export type SpriteDirection =
  | 'south' | 'east' | 'north' | 'west'
  | 'south-east' | 'north-east' | 'north-west' | 'south-west'

export type SpriteTierMap = Partial<Record<string, Record<SpriteDirection, number>>>

// [folder][build][tier][direction] = asset module (require)
export const SPRITE_REGISTRY: Record<string, Record<string, SpriteTierMap>> = {
  arauto: {
    arauto: {
      comum: {
        'south': require('../../../assets/sprites/heroes/arauto/arauto/comum/south.png'),
        'east': require('../../../assets/sprites/heroes/arauto/arauto/comum/east.png'),
        'north': require('../../../assets/sprites/heroes/arauto/arauto/comum/north.png'),
        'west': require('../../../assets/sprites/heroes/arauto/arauto/comum/west.png'),
        'south-east': require('../../../assets/sprites/heroes/arauto/arauto/comum/south-east.png'),
        'north-east': require('../../../assets/sprites/heroes/arauto/arauto/comum/north-east.png'),
        'north-west': require('../../../assets/sprites/heroes/arauto/arauto/comum/north-west.png'),
        'south-west': require('../../../assets/sprites/heroes/arauto/arauto/comum/south-west.png'),
      },
      lendario: {
        'south': require('../../../assets/sprites/heroes/arauto/arauto/lendario/south.png'),
        'east': require('../../../assets/sprites/heroes/arauto/arauto/lendario/east.png'),
        'north': require('../../../assets/sprites/heroes/arauto/arauto/lendario/north.png'),
        'west': require('../../../assets/sprites/heroes/arauto/arauto/lendario/west.png'),
        'south-east': require('../../../assets/sprites/heroes/arauto/arauto/lendario/south-east.png'),
        'north-east': require('../../../assets/sprites/heroes/arauto/arauto/lendario/north-east.png'),
        'north-west': require('../../../assets/sprites/heroes/arauto/arauto/lendario/north-west.png'),
        'south-west': require('../../../assets/sprites/heroes/arauto/arauto/lendario/south-west.png'),
      },
    },
    corneiro: {
      comum: {
        'south': require('../../../assets/sprites/heroes/arauto/corneiro/comum/south.png'),
        'east': require('../../../assets/sprites/heroes/arauto/corneiro/comum/east.png'),
        'north': require('../../../assets/sprites/heroes/arauto/corneiro/comum/north.png'),
        'west': require('../../../assets/sprites/heroes/arauto/corneiro/comum/west.png'),
        'south-east': require('../../../assets/sprites/heroes/arauto/corneiro/comum/south-east.png'),
        'north-east': require('../../../assets/sprites/heroes/arauto/corneiro/comum/north-east.png'),
        'north-west': require('../../../assets/sprites/heroes/arauto/corneiro/comum/north-west.png'),
        'south-west': require('../../../assets/sprites/heroes/arauto/corneiro/comum/south-west.png'),
      },
    },
  },
  destruidor: {
    fragmentador: {
      comum: {
        'south': require('../../../assets/sprites/heroes/destruidor/fragmentador/comum/south.png'),
        'east': require('../../../assets/sprites/heroes/destruidor/fragmentador/comum/east.png'),
        'north': require('../../../assets/sprites/heroes/destruidor/fragmentador/comum/north.png'),
        'west': require('../../../assets/sprites/heroes/destruidor/fragmentador/comum/west.png'),
        'south-east': require('../../../assets/sprites/heroes/destruidor/fragmentador/comum/south-east.png'),
        'north-east': require('../../../assets/sprites/heroes/destruidor/fragmentador/comum/north-east.png'),
        'north-west': require('../../../assets/sprites/heroes/destruidor/fragmentador/comum/north-west.png'),
        'south-west': require('../../../assets/sprites/heroes/destruidor/fragmentador/comum/south-west.png'),
      },
      lendario: {
        'south': require('../../../assets/sprites/heroes/destruidor/fragmentador/lendario/south.png'),
        'east': require('../../../assets/sprites/heroes/destruidor/fragmentador/lendario/east.png'),
        'north': require('../../../assets/sprites/heroes/destruidor/fragmentador/lendario/north.png'),
        'west': require('../../../assets/sprites/heroes/destruidor/fragmentador/lendario/west.png'),
        'south-east': require('../../../assets/sprites/heroes/destruidor/fragmentador/lendario/south-east.png'),
        'north-east': require('../../../assets/sprites/heroes/destruidor/fragmentador/lendario/north-east.png'),
        'north-west': require('../../../assets/sprites/heroes/destruidor/fragmentador/lendario/north-west.png'),
        'south-west': require('../../../assets/sprites/heroes/destruidor/fragmentador/lendario/south-west.png'),
      },
    },
    reaver: {
      comum: {
        'south': require('../../../assets/sprites/heroes/destruidor/reaver/comum/south.png'),
        'east': require('../../../assets/sprites/heroes/destruidor/reaver/comum/east.png'),
        'north': require('../../../assets/sprites/heroes/destruidor/reaver/comum/north.png'),
        'west': require('../../../assets/sprites/heroes/destruidor/reaver/comum/west.png'),
        'south-east': require('../../../assets/sprites/heroes/destruidor/reaver/comum/south-east.png'),
        'north-east': require('../../../assets/sprites/heroes/destruidor/reaver/comum/north-east.png'),
        'north-west': require('../../../assets/sprites/heroes/destruidor/reaver/comum/north-west.png'),
        'south-west': require('../../../assets/sprites/heroes/destruidor/reaver/comum/south-west.png'),
      },
    },
  },
  guardiao: {
    guardiao: {
      comum: {
        'south': require('../../../assets/sprites/heroes/guardiao/guardiao/comum/south.png'),
        'east': require('../../../assets/sprites/heroes/guardiao/guardiao/comum/east.png'),
        'north': require('../../../assets/sprites/heroes/guardiao/guardiao/comum/north.png'),
        'west': require('../../../assets/sprites/heroes/guardiao/guardiao/comum/west.png'),
        'south-east': require('../../../assets/sprites/heroes/guardiao/guardiao/comum/south-east.png'),
        'north-east': require('../../../assets/sprites/heroes/guardiao/guardiao/comum/north-east.png'),
        'north-west': require('../../../assets/sprites/heroes/guardiao/guardiao/comum/north-west.png'),
        'south-west': require('../../../assets/sprites/heroes/guardiao/guardiao/comum/south-west.png'),
      },
      lendario: {
        'south': require('../../../assets/sprites/heroes/guardiao/guardiao/lendario/south.png'),
        'east': require('../../../assets/sprites/heroes/guardiao/guardiao/lendario/east.png'),
        'north': require('../../../assets/sprites/heroes/guardiao/guardiao/lendario/north.png'),
        'west': require('../../../assets/sprites/heroes/guardiao/guardiao/lendario/west.png'),
        'south-east': require('../../../assets/sprites/heroes/guardiao/guardiao/lendario/south-east.png'),
        'north-east': require('../../../assets/sprites/heroes/guardiao/guardiao/lendario/north-east.png'),
        'north-west': require('../../../assets/sprites/heroes/guardiao/guardiao/lendario/north-west.png'),
        'south-west': require('../../../assets/sprites/heroes/guardiao/guardiao/lendario/south-west.png'),
      },
    },
    sentinela: {
      comum: {
        'south': require('../../../assets/sprites/heroes/guardiao/sentinela/comum/south.png'),
        'east': require('../../../assets/sprites/heroes/guardiao/sentinela/comum/east.png'),
        'north': require('../../../assets/sprites/heroes/guardiao/sentinela/comum/north.png'),
        'west': require('../../../assets/sprites/heroes/guardiao/sentinela/comum/west.png'),
        'south-east': require('../../../assets/sprites/heroes/guardiao/sentinela/comum/south-east.png'),
        'north-east': require('../../../assets/sprites/heroes/guardiao/sentinela/comum/north-east.png'),
        'north-west': require('../../../assets/sprites/heroes/guardiao/sentinela/comum/north-west.png'),
        'south-west': require('../../../assets/sprites/heroes/guardiao/sentinela/comum/south-west.png'),
      },
      lendario: {
        'south': require('../../../assets/sprites/heroes/guardiao/sentinela/lendario/south.png'),
        'east': require('../../../assets/sprites/heroes/guardiao/sentinela/lendario/east.png'),
        'north': require('../../../assets/sprites/heroes/guardiao/sentinela/lendario/north.png'),
        'west': require('../../../assets/sprites/heroes/guardiao/sentinela/lendario/west.png'),
        'south-east': require('../../../assets/sprites/heroes/guardiao/sentinela/lendario/south-east.png'),
        'north-east': require('../../../assets/sprites/heroes/guardiao/sentinela/lendario/north-east.png'),
        'north-west': require('../../../assets/sprites/heroes/guardiao/sentinela/lendario/north-west.png'),
        'south-west': require('../../../assets/sprites/heroes/guardiao/sentinela/lendario/south-west.png'),
      },
    },
  },
  invocador: {
    anciao: {
      comum: {
        'south': require('../../../assets/sprites/heroes/invocador/anciao/comum/south.png'),
        'east': require('../../../assets/sprites/heroes/invocador/anciao/comum/east.png'),
        'north': require('../../../assets/sprites/heroes/invocador/anciao/comum/north.png'),
        'west': require('../../../assets/sprites/heroes/invocador/anciao/comum/west.png'),
        'south-east': require('../../../assets/sprites/heroes/invocador/anciao/comum/south-east.png'),
        'north-east': require('../../../assets/sprites/heroes/invocador/anciao/comum/north-east.png'),
        'north-west': require('../../../assets/sprites/heroes/invocador/anciao/comum/north-west.png'),
        'south-west': require('../../../assets/sprites/heroes/invocador/anciao/comum/south-west.png'),
      },
      lendario: {
        'south': require('../../../assets/sprites/heroes/invocador/anciao/lendario/south.png'),
        'east': require('../../../assets/sprites/heroes/invocador/anciao/lendario/east.png'),
        'north': require('../../../assets/sprites/heroes/invocador/anciao/lendario/north.png'),
        'west': require('../../../assets/sprites/heroes/invocador/anciao/lendario/west.png'),
        'south-east': require('../../../assets/sprites/heroes/invocador/anciao/lendario/south-east.png'),
        'north-east': require('../../../assets/sprites/heroes/invocador/anciao/lendario/north-east.png'),
        'north-west': require('../../../assets/sprites/heroes/invocador/anciao/lendario/north-west.png'),
        'south-west': require('../../../assets/sprites/heroes/invocador/anciao/lendario/south-west.png'),
      },
    },
    invocador: {
      comum: {
        'south': require('../../../assets/sprites/heroes/invocador/invocador/comum/south.png'),
        'east': require('../../../assets/sprites/heroes/invocador/invocador/comum/east.png'),
        'north': require('../../../assets/sprites/heroes/invocador/invocador/comum/north.png'),
        'west': require('../../../assets/sprites/heroes/invocador/invocador/comum/west.png'),
        'south-east': require('../../../assets/sprites/heroes/invocador/invocador/comum/south-east.png'),
        'north-east': require('../../../assets/sprites/heroes/invocador/invocador/comum/north-east.png'),
        'north-west': require('../../../assets/sprites/heroes/invocador/invocador/comum/north-west.png'),
        'south-west': require('../../../assets/sprites/heroes/invocador/invocador/comum/south-west.png'),
      },
      lendario: {
        'south': require('../../../assets/sprites/heroes/invocador/invocador/lendario/south.png'),
        'east': require('../../../assets/sprites/heroes/invocador/invocador/lendario/east.png'),
        'north': require('../../../assets/sprites/heroes/invocador/invocador/lendario/north.png'),
        'west': require('../../../assets/sprites/heroes/invocador/invocador/lendario/west.png'),
        'south-east': require('../../../assets/sprites/heroes/invocador/invocador/lendario/south-east.png'),
        'north-east': require('../../../assets/sprites/heroes/invocador/invocador/lendario/north-east.png'),
        'north-west': require('../../../assets/sprites/heroes/invocador/invocador/lendario/north-west.png'),
        'south-west': require('../../../assets/sprites/heroes/invocador/invocador/lendario/south-west.png'),
      },
    },
  },
  trickster: {
    cacador: {
      comum: {
        'south': require('../../../assets/sprites/heroes/trickster/cacador/comum/south.png'),
        'east': require('../../../assets/sprites/heroes/trickster/cacador/comum/east.png'),
        'north': require('../../../assets/sprites/heroes/trickster/cacador/comum/north.png'),
        'west': require('../../../assets/sprites/heroes/trickster/cacador/comum/west.png'),
        'south-east': require('../../../assets/sprites/heroes/trickster/cacador/comum/south-east.png'),
        'north-east': require('../../../assets/sprites/heroes/trickster/cacador/comum/north-east.png'),
        'north-west': require('../../../assets/sprites/heroes/trickster/cacador/comum/north-west.png'),
        'south-west': require('../../../assets/sprites/heroes/trickster/cacador/comum/south-west.png'),
      },
      lendario: {
        'south': require('../../../assets/sprites/heroes/trickster/cacador/lendario/south.png'),
        'east': require('../../../assets/sprites/heroes/trickster/cacador/lendario/east.png'),
        'north': require('../../../assets/sprites/heroes/trickster/cacador/lendario/north.png'),
        'west': require('../../../assets/sprites/heroes/trickster/cacador/lendario/west.png'),
        'south-east': require('../../../assets/sprites/heroes/trickster/cacador/lendario/south-east.png'),
        'north-east': require('../../../assets/sprites/heroes/trickster/cacador/lendario/north-east.png'),
        'north-west': require('../../../assets/sprites/heroes/trickster/cacador/lendario/north-west.png'),
        'south-west': require('../../../assets/sprites/heroes/trickster/cacador/lendario/south-west.png'),
      },
    },
    vidente: {
      comum: {
        'south': require('../../../assets/sprites/heroes/trickster/vidente/comum/south.png'),
        'east': require('../../../assets/sprites/heroes/trickster/vidente/comum/east.png'),
        'north': require('../../../assets/sprites/heroes/trickster/vidente/comum/north.png'),
        'west': require('../../../assets/sprites/heroes/trickster/vidente/comum/west.png'),
        'south-east': require('../../../assets/sprites/heroes/trickster/vidente/comum/south-east.png'),
        'north-east': require('../../../assets/sprites/heroes/trickster/vidente/comum/north-east.png'),
        'north-west': require('../../../assets/sprites/heroes/trickster/vidente/comum/north-west.png'),
        'south-west': require('../../../assets/sprites/heroes/trickster/vidente/comum/south-west.png'),
      },
      lendario: {
        'south': require('../../../assets/sprites/heroes/trickster/vidente/lendario/south.png'),
        'east': require('../../../assets/sprites/heroes/trickster/vidente/lendario/east.png'),
        'north': require('../../../assets/sprites/heroes/trickster/vidente/lendario/north.png'),
        'west': require('../../../assets/sprites/heroes/trickster/vidente/lendario/west.png'),
        'south-east': require('../../../assets/sprites/heroes/trickster/vidente/lendario/south-east.png'),
        'north-east': require('../../../assets/sprites/heroes/trickster/vidente/lendario/north-east.png'),
        'north-west': require('../../../assets/sprites/heroes/trickster/vidente/lendario/north-west.png'),
        'south-west': require('../../../assets/sprites/heroes/trickster/vidente/lendario/south-west.png'),
      },
    },
  },
}
