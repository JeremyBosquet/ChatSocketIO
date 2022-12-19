#include "Warlock.hpp"

Warlock::Warlock(std::string const &name, std::string const &title)
{
    this->name = name;
    this->title = title;
    std::cout << this->name <<": This looks like another boring day.\n"; 
}

Warlock::~Warlock()
{
    std::cout << this->name <<": My job here is done!\n";
}

void Warlock::introduce(void) const
{
    std::cout << this->name <<": I am " << this->name << ", " << this->title <<"!\n";
}

std::string const &Warlock::getTitle(void) const
{
    return (this->title);
}

std::string const &Warlock::getName(void) const
{
    return (this->name);
}

void    Warlock::setTitle(std::string const &title)
{
    this->title = title;
}

void    Warlock::learnSpell(ASpell *other)
{
    this->book.learnSpell(other);
}

void    Warlock::forgetSpell(std::string const &name)
{
    this->book.forgetSpell(name);
}

void    Warlock::launchSpell(std::string const &name, ATarget &other)
{
    ATarget const *test = 0;
    if (test == &other)
        return;
    ASpell *temp = book.createSpell(name);
    if (temp)
        temp->launch(other);
}