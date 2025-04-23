import { Test } from '@nestjs/testing';
import { CacheService } from './cache.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

describe('CacheService', () => {
  let cacheService: CacheService;
  let cacheManager: Cache;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: vi.fn(),
            set: vi.fn(),
            del: vi.fn(),
            reset: vi.fn(),
          },
        },
      ],
    }).compile();

    cacheService = moduleRef.get<CacheService>(CacheService);
    cacheManager = moduleRef.get<Cache>(CACHE_MANAGER);
  });

  describe('get', () => {
    it('should return cached value when it exists', async () => {
      const mockValue = { data: 'test' };
      vi.spyOn(cacheManager, 'get').mockResolvedValue(mockValue);

      const result = await cacheService.get('test-key');
      expect(result).toEqual(mockValue);
    });

    it('should return null when cached value does not exist', async () => {
      vi.spyOn(cacheManager, 'get').mockResolvedValue(undefined);

      const result = await cacheService.get('test-key');
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should call cache manager set with correct parameters', async () => {
      const spy = vi.spyOn(cacheManager, 'set');
      const value = { data: 'test' };
      const ttl = 1000;

      await cacheService.set('test-key', value, ttl);
      expect(spy).toHaveBeenCalledWith('test-key', value, ttl);
    });
  });
});
