#include "Fireball.hpp"

Fireball::Fireball(void) : ASpell("Fireball", "fwooshed")
{

}

Fireball::~Fireball(void)
{

}

ASpell *Fireball::clone(void) const
{
    return (new Fireball());
}